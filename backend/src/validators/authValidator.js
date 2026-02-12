const { body, param, query } = require('express-validator');
const { isValidEmail, isValidPassword } = require('../utils/validators');

const registerValidator = [
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Invalid email format')
        .normalizeEmail()
        .custom((email) => {
            const validation = isValidEmail(email);
            if (!validation.valid) {
                throw new Error(validation.error);
            }
            return true;
        }),

    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .custom((password) => {
            const validation = isValidPassword(password);
            if (!validation.valid) {
                throw new Error(validation.errors.join(', '));
            }
            return true;
        })
];

const loginValidator = [
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Invalid email format')
        .normalizeEmail(),

    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

const verifyCodeValidator = [
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Invalid email format')
        .normalizeEmail(),

    body('code')
        .trim()
        .notEmpty()
        .withMessage('Verification code is required')
        .isLength({ min: 6, max: 6 })
        .withMessage('Verification code must be 6 digits')
        .isNumeric()
        .withMessage('Verification code must contain only numbers')
];

const googleAuthValidator = [
    body('token')
        .notEmpty()
        .withMessage('Google token is required')
        .isString()
        .withMessage('Token must be a string')
];

const refreshTokenValidator = [
    body('refreshToken')
        .notEmpty()
        .withMessage('Refresh token is required')
        .isString()
        .withMessage('Refresh token must be a string')
];

module.exports = {
    registerValidator,
    loginValidator,
    verifyCodeValidator,
    googleAuthValidator,
    refreshTokenValidator
};
