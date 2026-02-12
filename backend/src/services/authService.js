const bcrypt = require('bcrypt');
const { User, VerificationCode, Session } = require('../models');
const TokenManager = require('../utils/tokenManager');
const { generateVerificationCode } = require('../utils/validators');
const emailService = require('./emailService');
const googleOAuthService = require('./googleOAuthService');
const authConfig = require('../config/auth');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

class AuthService {
    /**
     * Register new user
     */
    async register(email, password, fullName = null, birthDate = null, gender = null) {
        try {
            // Check if user already exists
            const existingUser = await User.findOne({ where: { email } });

            if (existingUser) {
                throw new Error('El correo electrónico ya está registrado');
            }

            // Hash password
            const passwordHash = await bcrypt.hash(password, authConfig.password.bcryptRounds);

            // Create user
            const user = await User.create({
                email,
                password_hash: passwordHash,
                is_verified: false, // Email verification required
                full_name: fullName || null,
                birth_date: birthDate || null,
                gender: gender || null
            });

            // Generate verification code
            const code = generateVerificationCode();
            const expiresAt = new Date(Date.now() + authConfig.verification.codeExpiration * 60 * 1000);

            // Save verification code
            await VerificationCode.create({
                user_id: user.id,
                code,
                expires_at: expiresAt
            });

            // Send verification email
            try {
                await emailService.sendVerificationCode(email, code, authConfig.verification.codeExpiration);
            } catch (error) {
                if (process.env.NODE_ENV === 'development') {
                    logger.warn('Email service failed to send code. Printing to console for development:', { email, code });
                } else {
                    throw error;
                }
            }

            logger.info('User registered successfully:', { email });

            return {
                success: true,
                message: 'Registration successful. Please check your email for verification code.',
                data: {
                    email: user.email
                }
            };
        } catch (error) {
            logger.error('Registration error:', error);
            throw error;
        }
    }

    /**
     * Verify email with code
     */
    async verifyEmail(email, code) {
        try {
            // Find user
            const user = await User.findOne({ where: { email } });

            if (!user) {
                throw new Error('User not found');
            }

            if (user.is_verified) {
                throw new Error('User already verified');
            }

            // Find valid verification code
            const verificationCode = await VerificationCode.findOne({
                where: {
                    user_id: user.id,
                    code,
                    is_used: false,
                    expires_at: { [Op.gt]: new Date() }
                }
            });

            if (!verificationCode) {
                throw new Error('Invalid or expired verification code');
            }

            // Check attempts
            if (verificationCode.attempts >= authConfig.verification.maxAttempts) {
                throw new Error('Maximum verification attempts exceeded');
            }

            // Mark code as used
            verificationCode.is_used = true;
            await verificationCode.save();

            // Mark user as verified
            user.is_verified = true;
            await user.save();

            // Generate tokens
            const tokens = TokenManager.generateTokenPair(user.id, user.email, user.role);

            // Save refresh token session
            const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
            await Session.create({
                user_id: user.id,
                refresh_token: tokens.refreshToken,
                expires_at: expiresAt
            });

            logger.info('Email verified successfully:', { email });

            return {
                success: true,
                message: 'Email verified successfully',
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        role: user.role
                    },
                    tokens
                }
            };
        } catch (error) {
            logger.error('Verification error:', error);
            throw error;
        }
    }

    /**
     * Login user
     */
    async login(email, password) {
        try {
            // Find user
            const user = await User.findOne({ where: { email } });

            if (!user) {
                throw new Error('Invalid credentials');
            }

            if (!user.is_verified) {
                if (process.env.NODE_ENV === 'development') {
                    logger.info('Auto-verifying user in development mode:', { email });
                    user.is_verified = true;
                    await user.save();
                } else {
                    throw new Error('Email not verified. Please verify your email first.');
                }
            }

            // Check password
            const isPasswordValid = await bcrypt.compare(password, user.password_hash);

            if (!isPasswordValid) {
                throw new Error('Invalid credentials');
            }

            // Generate tokens
            const tokens = TokenManager.generateTokenPair(user.id, user.email, user.role);

            // Save refresh token session
            const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
            await Session.create({
                user_id: user.id,
                refresh_token: tokens.refreshToken,
                expires_at: expiresAt
            });

            logger.info('User logged in successfully:', { email });

            return {
                success: true,
                message: 'Login successful',
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        role: user.role
                    },
                    tokens
                }
            };
        } catch (error) {
            logger.error('Login error:', error);
            throw error;
        }
    }

    /**
     * Google OAuth login
     */
    async googleLogin(token) {
        try {
            // Verify Google token
            const googleData = await googleOAuthService.verifyToken(token);

            if (!googleData.success) {
                throw new Error('Invalid Google token');
            }

            const { googleId, email, emailVerified } = googleData.data;

            if (!emailVerified) {
                throw new Error('Google email not verified');
            }

            // Find or create user
            let user = await User.findOne({
                where: {
                    [Op.or]: [{ google_id: googleId }, { email }]
                }
            });

            if (user) {
                // Update Google ID if not set
                if (!user.google_id) {
                    user.google_id = googleId;
                    await user.save();
                }
            } else {
                // Create new user
                user = await User.create({
                    email,
                    google_id: googleId,
                    is_verified: true // Google users are pre-verified
                });
            }

            // Generate tokens
            const tokens = TokenManager.generateTokenPair(user.id, user.email, user.role);

            // Save refresh token session
            const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
            await Session.create({
                user_id: user.id,
                refresh_token: tokens.refreshToken,
                expires_at: expiresAt
            });

            logger.info('Google login successful:', { email });

            return {
                success: true,
                message: 'Google login successful',
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        role: user.role
                    },
                    tokens
                }
            };
        } catch (error) {
            logger.error('Google login error:', error);
            throw error;
        }
    }

    /**
     * Refresh access token
     */
    async refreshToken(refreshToken) {
        try {
            // Verify refresh token
            const decoded = TokenManager.verifyToken(refreshToken);

            // Find session
            const session = await Session.findOne({
                where: {
                    refresh_token: refreshToken,
                    user_id: decoded.userId,
                    revoked_at: null,
                    expires_at: { [Op.gt]: new Date() }
                }
            });

            if (!session) {
                throw new Error('Invalid or expired refresh token');
            }

            // Generate new access token
            const accessToken = TokenManager.generateAccessToken({
                userId: decoded.userId,
                email: decoded.email,
                role: decoded.role
            });

            logger.info('Token refreshed successfully:', { userId: decoded.userId });

            return {
                success: true,
                data: {
                    accessToken
                }
            };
        } catch (error) {
            logger.error('Token refresh error:', error);
            throw error;
        }
    }

    /**
     * Logout user
     */
    async logout(refreshToken) {
        try {
            // Revoke session
            await Session.update(
                { revoked_at: new Date() },
                { where: { refresh_token: refreshToken } }
            );

            logger.info('User logged out successfully');

            return {
                success: true,
                message: 'Logout successful'
            };
        } catch (error) {
            logger.error('Logout error:', error);
            throw error;
        }
    }
}

module.exports = new AuthService();
