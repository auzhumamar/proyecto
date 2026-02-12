const authConfig = require('../config/auth');

/**
 * Validate email format and domain
 */
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { valid: false, error: 'Invalid email format' };
    }

    const domain = email.split('@')[1];
    if (!authConfig.email.allowedDomains.includes(domain)) {
        return {
            valid: false,
            error: `Email domain not allowed. Allowed domains: ${authConfig.email.allowedDomains.join(', ')}`
        };
    }

    return { valid: true };
};

/**
 * Validate password strength
 */
const isValidPassword = (password) => {
    const errors = [];

    if (password.length < authConfig.password.minLength) {
        errors.push(`Password must be at least ${authConfig.password.minLength} characters`);
    }

    if (authConfig.password.requireUppercase && !/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }

    if (authConfig.password.requireNumber && !/\d/.test(password)) {
        errors.push('Password must contain at least one number');
    }

    if (authConfig.password.requireSymbol && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Password must contain at least one special character');
    }

    return {
        valid: errors.length === 0,
        errors
    };
};

/**
 * Validate BPM range
 */
const isValidBPM = (bpm) => {
    const MIN_BPM = 30;
    const MAX_BPM = 220;

    if (typeof bpm !== 'number' || !Number.isInteger(bpm)) {
        return { valid: false, error: 'BPM must be an integer' };
    }

    if (bpm < MIN_BPM || bpm > MAX_BPM) {
        return {
            valid: false,
            error: `BPM must be between ${MIN_BPM} and ${MAX_BPM}`
        };
    }

    return { valid: true };
};

/**
 * Validate timestamp (not in future)
 */
const isValidTimestamp = (timestamp) => {
    const date = new Date(timestamp);

    if (isNaN(date.getTime())) {
        return { valid: false, error: 'Invalid timestamp format' };
    }

    if (date > new Date()) {
        return { valid: false, error: 'Timestamp cannot be in the future' };
    }

    return { valid: true };
};

/**
 * Validate ECG signal data
 */
const isValidECGSignal = (ecgSignal) => {
    if (!Array.isArray(ecgSignal)) {
        return { valid: false, error: 'ECG signal must be an array' };
    }

    if (ecgSignal.length === 0) {
        return { valid: false, error: 'ECG signal cannot be empty' };
    }

    const allNumbers = ecgSignal.every(value => typeof value === 'number');
    if (!allNumbers) {
        return { valid: false, error: 'ECG signal must contain only numbers' };
    }

    return { valid: true };
};

/**
 * Generate random 6-digit verification code
 */
const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

module.exports = {
    isValidEmail,
    isValidPassword,
    isValidBPM,
    isValidTimestamp,
    isValidECGSignal,
    generateVerificationCode
};
