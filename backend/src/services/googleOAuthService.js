const { OAuth2Client } = require('google-auth-library');
const authConfig = require('../config/auth');
const logger = require('../utils/logger');

class GoogleOAuthService {
    constructor() {
        this.client = new OAuth2Client(authConfig.google.clientId);
    }

    /**
     * Verify Google ID token
     */
    async verifyToken(token) {
        try {
            const ticket = await this.client.verifyIdToken({
                idToken: token,
                audience: authConfig.google.clientId
            });

            const payload = ticket.getPayload();

            return {
                success: true,
                data: {
                    googleId: payload.sub,
                    email: payload.email,
                    emailVerified: payload.email_verified,
                    name: payload.name,
                    picture: payload.picture
                }
            };
        } catch (error) {
            logger.error('Google token verification failed:', error);
            throw new Error('Invalid Google token');
        }
    }
}

module.exports = new GoogleOAuthService();
