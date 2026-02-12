const { body, param, query } = require('express-validator');
const { isValidBPM, isValidTimestamp, isValidECGSignal } = require('../utils/validators');

const createMeasurementValidator = [
    body('patient_id')
        .notEmpty()
        .withMessage('Patient ID is required')
        .isUUID()
        .withMessage('Invalid patient ID'),

    body('bpm')
        .notEmpty()
        .withMessage('BPM is required')
        .isInt()
        .withMessage('BPM must be an integer')
        .custom((bpm) => {
            const validation = isValidBPM(bpm);
            if (!validation.valid) {
                throw new Error(validation.error);
            }
            return true;
        }),

    body('ecg_signal')
        .optional()
        .custom((ecgSignal) => {
            if (ecgSignal !== null && ecgSignal !== undefined) {
                const validation = isValidECGSignal(ecgSignal);
                if (!validation.valid) {
                    throw new Error(validation.error);
                }
            }
            return true;
        }),

    body('electrode_status')
        .optional()
        .isObject()
        .withMessage('Electrode status must be an object'),

    body('measured_at')
        .notEmpty()
        .withMessage('Measurement timestamp is required')
        .custom((timestamp) => {
            const validation = isValidTimestamp(timestamp);
            if (!validation.valid) {
                throw new Error(validation.error);
            }
            return true;
        })
];

const getMeasurementsValidator = [
    param('patientId')
        .isUUID()
        .withMessage('Invalid patient ID'),

    query('limit')
        .optional()
        .isInt({ min: 1, max: 1000 })
        .withMessage('Limit must be between 1 and 1000'),

    query('offset')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Offset must be a positive integer'),

    query('startDate')
        .optional()
        .isISO8601()
        .withMessage('Invalid start date format'),

    query('endDate')
        .optional()
        .isISO8601()
        .withMessage('Invalid end date format')
];

const patientIdParamValidator = [
    param('patientId')
        .isUUID()
        .withMessage('Invalid patient ID')
];

module.exports = {
    createMeasurementValidator,
    getMeasurementsValidator,
    patientIdParamValidator
};
