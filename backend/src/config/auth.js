require('dotenv').config();

module.exports = {
    jwt: {
        secret: process.env.JWT_SECRET,
        accessExpiration: process.env.JWT_ACCESS_EXPIRATION || '15m',
        refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d'
    },

    google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        redirectUri: process.env.GOOGLE_REDIRECT_URI
    },

    verification: {
        codeExpiration: parseInt(process.env.VERIFICATION_CODE_EXPIRATION) || 10, // minutes
        maxAttempts: parseInt(process.env.VERIFICATION_CODE_MAX_ATTEMPTS) || 3
    },

    password: {
        minLength: 8,
        requireUppercase: true,
        requireNumber: true,
        requireSymbol: true,
        bcryptRounds: 12
    },

    email: {
        allowedDomains: [
            'gmail.com',
            'hotmail.com',
            'outlook.com',
            'yahoo.com',
            'icloud.com',
            'protonmail.com'
        ]
    }
};
