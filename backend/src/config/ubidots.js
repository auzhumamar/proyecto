require('dotenv').config();

module.exports = {
    token: process.env.UBIDOTS_TOKEN,
    apiUrl: process.env.UBIDOTS_API_URL,
    deviceLabel: process.env.UBIDOTS_DEVICE_LABEL,

    endpoints: {
        devices: '/devices',
        variables: '/variables',
        values: '/values'
    },

    sync: {
        cronSchedule: process.env.SYNC_CRON_SCHEDULE || '*/5 * * * *', // Every 5 minutes
        maxRetries: parseInt(process.env.SYNC_MAX_RETRIES) || 3,
        retryDelay: parseInt(process.env.SYNC_RETRY_DELAY) || 60000 // 1 minute
    },

    variables: {
        bpm: 'heart-rate',
        ecg: 'ecg-signal',
        electrodeStatus: 'electrode-status'
    }
};
