const { body, param } = require('express-validator');

const createPatientValidator = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Patient name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters'),

    body('age')
        .optional()
        .isInt({ min: 0, max: 150 })
        .withMessage('Age must be between 0 and 150'),

    body('gender')
        .optional()
        .isIn(['male', 'female', 'other'])
        .withMessage('Gender must be male, female, or other'),

    body('medical_history')
        .optional()
        .isString()
        .withMessage('Medical history must be a string')
        .isLength({ max: 5000 })
        .withMessage('Medical history cannot exceed 5000 characters')
];

const updatePatientValidator = [
    param('id')
        .isUUID()
        .withMessage('Invalid patient ID'),

    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters'),

    body('age')
        .optional()
        .isInt({ min: 0, max: 150 })
        .withMessage('Age must be between 0 and 150'),

    body('gender')
        .optional()
        .isIn(['male', 'female', 'other'])
        .withMessage('Gender must be male, female, or other'),

    body('medical_history')
        .optional()
        .isString()
        .withMessage('Medical history must be a string')
        .isLength({ max: 5000 })
        .withMessage('Medical history cannot exceed 5000 characters')
];

const patientIdValidator = [
    param('id')
        .isUUID()
        .withMessage('Invalid patient ID')
];

module.exports = {
    createPatientValidator,
    updatePatientValidator,
    patientIdValidator
};
