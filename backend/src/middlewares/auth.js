const TokenManager = require('../utils/tokenManager');
const logger = require('../utils/logger');

/**
 * Middleware to authenticate JWT tokens
 */
const authenticate = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify token
        const decoded = TokenManager.verifyToken(token);

        // Attach user info to request
        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role
        };

        next();
    } catch (error) {
        logger.error('Authentication error:', error);

        if (error.message === 'Token has expired') {
            return res.status(401).json({
                success: false,
                message: 'Token has expired',
                code: 'TOKEN_EXPIRED'
            });
        }

        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
};

/**
 * Middleware to check if user has required role
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
        }

        next();
    };
};

module.exports = { authenticate, authorize };
