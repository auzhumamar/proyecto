const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const {
    createPatientValidator,
    updatePatientValidator,
    patientIdValidator
} = require('../validators/patientValidator');
const { validate } = require('../middlewares/sanitizer');
const { authenticate } = require('../middlewares/auth');

// All patient routes require authentication
router.use(authenticate);

// Create patient
router.post(
    '/',
    createPatientValidator,
    validate,
    patientController.createPatient
);

// Get all patients
router.get(
    '/',
    patientController.getPatients
);

// Get patient by ID
router.get(
    '/:id',
    patientIdValidator,
    validate,
    patientController.getPatientById
);

// Update patient
router.put(
    '/:id',
    updatePatientValidator,
    validate,
    patientController.updatePatient
);

// Delete patient
router.delete(
    '/:id',
    patientIdValidator,
    validate,
    patientController.deletePatient
);

module.exports = router;
