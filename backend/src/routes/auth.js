const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const {
    registerValidator,
    loginValidator,
    verifyCodeValidator,
    googleAuthValidator,
    refreshTokenValidator
} = require('../validators/authValidator');
const { validate } = require('../middlewares/sanitizer');
const { authLimiter, verificationLimiter } = require('../middlewares/rateLimiter');

// Register
router.post(
    '/register',
    authLimiter,
    registerValidator,
    validate,
    authController.register
);

// Verify email
router.post(
    '/verify',
    verificationLimiter,
    verifyCodeValidator,
    validate,
    authController.verify
);

// Login
router.post(
    '/login',
    authLimiter,
    loginValidator,
    validate,
    authController.login
);

// Google OAuth
router.post(
    '/google',
    googleAuthValidator,
    validate,
    authController.googleLogin
);

// Refresh token
router.post(
    '/refresh',
    refreshTokenValidator,
    validate,
    authController.refresh
);

// Logout
router.post(
    '/logout',
    refreshTokenValidator,
    validate,
    authController.logout
);

module.exports = router;
