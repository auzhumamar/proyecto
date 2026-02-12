const measurementService = require('../services/measurementService');
const logger = require('../utils/logger');

class MeasurementController {
    /**
     * Create new measurement (from ESP32)
     */
    async createMeasurement(req, res, next) {
        try {
            const measurementData = req.body;

            const result = await measurementService.createMeasurement(measurementData);

            res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get measurements for a patient
     */
    async getMeasurements(req, res, next) {
        try {
            const { patientId } = req.params;
            const { limit, offset, startDate, endDate } = req.query;

            const result = await measurementService.getMeasurementsByPatient(patientId, {
                limit,
                offset,
                startDate,
                endDate
            });

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get latest measurement for a patient
     */
    async getLatestMeasurement(req, res, next) {
        try {
            const { patientId } = req.params;

            const result = await measurementService.getLatestMeasurement(patientId);

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get measurement statistics for a patient
     */
    async getMeasurementStats(req, res, next) {
        try {
            const { patientId } = req.params;
            const { startDate, endDate } = req.query;

            const result = await measurementService.getMeasurementStats(patientId, {
                startDate,
                endDate
            });

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new MeasurementController();
