require('dotenv').config();
const app = require('./src/app');
const { testConnection } = require('./src/config/database');
const { syncDatabase } = require('./src/models');
const emailService = require('./src/services/emailService');
const logger = require('./src/utils/logger');
const cron = require('node-cron');
const syncService = require('./src/services/syncService');
const ubidotsConfig = require('./src/config/ubidots');

const PORT = process.env.PORT || 3000;

// Initialize server
const startServer = async () => {
    try {
        // Test database connection
        await testConnection();

        // Sync database models
        await syncDatabase(false); // Set to true to drop and recreate tables

        // Verify email service
        const isEmailReady = await emailService.verifyConnection();
        if (!isEmailReady && process.env.NODE_ENV === 'production') {
            throw new Error('Email service is not ready. Please check your configuration.');
        } else if (!isEmailReady) {
            logger.warn('Email service is not ready. Registration emails might not be sent.');
        }

        // Start cron job for automatic sync
        cron.schedule(ubidotsConfig.sync.cronSchedule, async () => {
            logger.info('Running scheduled sync job...');
            try {
                await syncService.syncPendingMeasurements();
            } catch (error) {
                logger.error('Scheduled sync failed:', error);
            }
        });

        logger.info(`Sync cron job scheduled: ${ubidotsConfig.sync.cronSchedule}`);

        // Start server
        app.listen(PORT, () => {
            logger.info(`🫀 CardioTrack server running on port ${PORT}`);
            logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
            logger.info(`API Base URL: http://localhost:${PORT}/api`);
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    process.exit(0);
});

process.on('SIGINT', () => {
    logger.info('SIGINT signal received: closing HTTP server');
    process.exit(0);
});

// Start the server
startServer();
