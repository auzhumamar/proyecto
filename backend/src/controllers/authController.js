const authService = require('../services/authService');
const logger = require('../utils/logger');

class AuthController {
    /**
     * Register new user
     */
    async register(req, res) {
        try {
            const { email, password, fullName, birthDate, gender } = req.body;
            const result = await authService.register(email, password, fullName, birthDate, gender);

            res.status(201).json(result);
        } catch (error) {
            logger.error('Registration error:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Registration failed'
            });
        }
    }

    /**
     * Verify email with code
     */
    async verify(req, res, next) {
        try {
            const { email, code } = req.body;
            const result = await authService.verifyEmail(email, code);

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Login user
     */
    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const result = await authService.login(email, password);

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Google OAuth login
     */
    async googleLogin(req, res, next) {
        try {
            const { token } = req.body;
            const result = await authService.googleLogin(token);

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Refresh access token
     */
    async refresh(req, res, next) {
        try {
            const { refreshToken } = req.body;
            const result = await authService.refreshToken(refreshToken);

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Logout user
     */
    async logout(req, res, next) {
        try {
            const { refreshToken } = req.body;
            const result = await authService.logout(refreshToken);

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AuthController();
