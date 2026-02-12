const patientService = require('../services/patientService');
const logger = require('../utils/logger');

class PatientController {
    /**
     * Create new patient
     */
    async createPatient(req, res, next) {
        try {
            const userId = req.user.userId;
            const patientData = req.body;

            const result = await patientService.createPatient(userId, patientData);

            res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get all patients for logged-in user
     */
    async getPatients(req, res, next) {
        try {
            const userId = req.user.userId;

            const result = await patientService.getPatientsByUser(userId);

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get patient by ID
     */
    async getPatientById(req, res, next) {
        try {
            const userId = req.user.userId;
            const { id } = req.params;

            const result = await patientService.getPatientById(id, userId);

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update patient
     */
    async updatePatient(req, res, next) {
        try {
            const userId = req.user.userId;
            const { id } = req.params;
            const updateData = req.body;

            const result = await patientService.updatePatient(id, userId, updateData);

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete patient
     */
    async deletePatient(req, res, next) {
        try {
            const userId = req.user.userId;
            const { id } = req.params;

            const result = await patientService.deletePatient(id, userId);

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new PatientController();
