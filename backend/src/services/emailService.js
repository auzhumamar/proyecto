const nodemailer = require('nodemailer');
const emailConfig = require('../config/email');
const logger = require('../utils/logger');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: emailConfig.service,
            host: emailConfig.host,
            port: emailConfig.port,
            secure: emailConfig.secure,
            auth: emailConfig.auth
        });
    }

    /**
     * Send verification code email
     */
    async sendVerificationCode(email, code, expirationMinutes) {
        try {
            const mailOptions = {
                from: emailConfig.from,
                to: email,
                subject: emailConfig.templates.verification.subject,
                html: emailConfig.templates.verification.getHtml(code, expirationMinutes)
            };

            const info = await this.transporter.sendMail(mailOptions);

            logger.info('Verification email sent:', {
                messageId: info.messageId,
                to: email
            });

            return {
                success: true,
                messageId: info.messageId
            };
        } catch (error) {
            logger.error('Error sending verification email:', error);
            throw new Error('Failed to send verification email');
        }
    }

    /**
     * Verify transporter configuration
     */
    async verifyConnection() {
        try {
            await this.transporter.verify();
            logger.info('Email service is ready');
            return true;
        } catch (error) {
            logger.error('Email service verification failed:', error);
            return false;
        }
    }
}

module.exports = new EmailService();
