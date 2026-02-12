const { HeartMeasurement, Patient, SyncStatus } = require('../models');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

class MeasurementService {
    /**
     * Create new heart measurement
     */
    async createMeasurement(measurementData) {
        try {
            const { patient_id, bpm, ecg_signal, electrode_status, measured_at } = measurementData;

            // Verify patient exists
            const patient = await Patient.findByPk(patient_id);
            if (!patient) {
                throw new Error('Patient not found');
            }

            // Create measurement
            const measurement = await HeartMeasurement.create({
                patient_id,
                bpm,
                ecg_signal,
                electrode_status,
                measured_at,
                is_synced: false
            });

            // Create sync status record
            await SyncStatus.create({
                measurement_id: measurement.id,
                status: 'pending'
            });

            logger.info('Measurement created successfully:', {
                measurementId: measurement.id,
                patientId: patient_id,
                bpm
            });

            return {
                success: true,
                message: 'Measurement recorded successfully',
                data: measurement
            };
        } catch (error) {
            logger.error('Error creating measurement:', error);
            throw error;
        }
    }

    /**
     * Get measurements for a patient
     */
    async getMeasurementsByPatient(patientId, options = {}) {
        try {
            const { limit = 100, offset = 0, startDate, endDate } = options;

            const whereClause = { patient_id: patientId };

            // Add date range filter if provided
            if (startDate || endDate) {
                whereClause.measured_at = {};
                if (startDate) {
                    whereClause.measured_at[Op.gte] = new Date(startDate);
                }
                if (endDate) {
                    whereClause.measured_at[Op.lte] = new Date(endDate);
                }
            }

            const measurements = await HeartMeasurement.findAll({
                where: whereClause,
                limit: parseInt(limit),
                offset: parseInt(offset),
                order: [['measured_at', 'DESC']],
                include: [{
                    model: SyncStatus,
                    as: 'syncStatus',
                    attributes: ['status', 'ubidots_id']
                }]
            });

            const count = await HeartMeasurement.count({ where: whereClause });

            return {
                success: true,
                data: {
                    measurements,
                    pagination: {
                        total: count,
                        limit: parseInt(limit),
                        offset: parseInt(offset)
                    }
                }
            };
        } catch (error) {
            logger.error('Error fetching measurements:', error);
            throw error;
        }
    }

    /**
     * Get latest measurement for a patient
     */
    async getLatestMeasurement(patientId) {
        try {
            const measurement = await HeartMeasurement.findOne({
                where: { patient_id: patientId },
                order: [['measured_at', 'DESC']],
                include: [{
                    model: SyncStatus,
                    as: 'syncStatus',
                    attributes: ['status', 'ubidots_id']
                }]
            });

            if (!measurement) {
                return {
                    success: true,
                    data: null
                };
            }

            return {
                success: true,
                data: measurement
            };
        } catch (error) {
            logger.error('Error fetching latest measurement:', error);
            throw error;
        }
    }

    /**
     * Get measurement statistics for a patient
     */
    async getMeasurementStats(patientId, options = {}) {
        try {
            const { startDate, endDate } = options;

            const whereClause = { patient_id: patientId };

            if (startDate || endDate) {
                whereClause.measured_at = {};
                if (startDate) {
                    whereClause.measured_at[Op.gte] = new Date(startDate);
                }
                if (endDate) {
                    whereClause.measured_at[Op.lte] = new Date(endDate);
                }
            }

            const measurements = await HeartMeasurement.findAll({
                where: whereClause,
                attributes: ['bpm', 'measured_at']
            });

            if (measurements.length === 0) {
                return {
                    success: true,
                    data: {
                        count: 0,
                        avgBpm: null,
                        minBpm: null,
                        maxBpm: null
                    }
                };
            }

            const bpmValues = measurements.map(m => m.bpm);
            const avgBpm = Math.round(bpmValues.reduce((a, b) => a + b, 0) / bpmValues.length);
            const minBpm = Math.min(...bpmValues);
            const maxBpm = Math.max(...bpmValues);

            return {
                success: true,
                data: {
                    count: measurements.length,
                    avgBpm,
                    minBpm,
                    maxBpm
                }
            };
        } catch (error) {
            logger.error('Error calculating measurement stats:', error);
            throw error;
        }
    }
}

module.exports = new MeasurementService();
