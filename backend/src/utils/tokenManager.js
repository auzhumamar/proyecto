const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const authConfig = require('../config/auth');
const logger = require('./logger');

class TokenManager {
    /**
     * Generate access token
     */
    static generateAccessToken(payload) {
        try {
            return jwt.sign(payload, authConfig.jwt.secret, {
                expiresIn: authConfig.jwt.accessExpiration
            });
        } catch (error) {
            logger.error('Error generating access token:', error);
            throw new Error('Failed to generate access token');
        }
    }

    /**
     * Generate refresh token
     */
    static generateRefreshToken(payload) {
        try {
            return jwt.sign(payload, authConfig.jwt.secret, {
                expiresIn: authConfig.jwt.refreshExpiration,
                jwtid: uuidv4()
            });
        } catch (error) {
            logger.error('Error generating refresh token:', error);
            throw new Error('Failed to generate refresh token');
        }
    }

    /**
     * Verify token
     */
    static verifyToken(token) {
        try {
            return jwt.verify(token, authConfig.jwt.secret);
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw new Error('Token has expired');
            } else if (error.name === 'JsonWebTokenError') {
                throw new Error('Invalid token');
            }
            logger.error('Error verifying token:', error);
            throw new Error('Token verification failed');
        }
    }

    /**
     * Decode token without verification
     */
    static decodeToken(token) {
        try {
            return jwt.decode(token);
        } catch (error) {
            logger.error('Error decoding token:', error);
            return null;
        }
    }

    /**
     * Generate token pair (access + refresh)
     */
    static generateTokenPair(userId, email, role) {
        const payload = { userId, email, role };

        return {
            accessToken: this.generateAccessToken(payload),
            refreshToken: this.generateRefreshToken(payload)
        };
    }
}

module.exports = TokenManager;
