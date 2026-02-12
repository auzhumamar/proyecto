const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const patientRoutes = require('./patients');
const measurementRoutes = require('./measurements');
const syncRoutes = require('./sync');

// API version prefix
const API_VERSION = process.env.API_VERSION || 'v1';

// Mount routes
router.use(`/${API_VERSION}/auth`, authRoutes);
router.use(`/${API_VERSION}/patients`, patientRoutes);
router.use(`/${API_VERSION}/measurements`, measurementRoutes);
router.use(`/${API_VERSION}/sync`, syncRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'CardioTrack API is running',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
