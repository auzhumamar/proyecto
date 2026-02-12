const express = require('express');
const router = express.Router();
const measurementController = require('../controllers/measurementController');
const {
    createMeasurementValidator,
    getMeasurementsValidator,
    patientIdParamValidator
} = require('../validators/measurementValidator');
const { validate } = require('../middlewares/sanitizer');
const { authenticate } = require('../middlewares/auth');

// Create measurement (ESP32 endpoint - may need different auth)
router.post(
    '/',
    createMeasurementValidator,
    validate,
    measurementController.createMeasurement
);

// All other routes require authentication
router.use(authenticate);

// Get measurements for a patient
router.get(
    '/:patientId',
    getMeasurementsValidator,
    validate,
    measurementController.getMeasurements
);

// Get latest measurement for a patient
router.get(
    '/:patientId/latest',
    patientIdParamValidator,
    validate,
    measurementController.getLatestMeasurement
);

// Get measurement statistics for a patient
router.get(
    '/:patientId/stats',
    getMeasurementsValidator,
    validate,
    measurementController.getMeasurementStats
);

module.exports = router;
