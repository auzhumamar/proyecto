const { Patient } = require('../models');
const logger = require('../utils/logger');

class PatientService {
    /**
     * Create new patient
     */
    async createPatient(userId, patientData) {
        try {
            const patient = await Patient.create({
                user_id: userId,
                ...patientData
            });

            logger.info('Patient created successfully:', { patientId: patient.id, userId });

            return {
                success: true,
                message: 'Patient created successfully',
                data: patient
            };
        } catch (error) {
            logger.error('Error creating patient:', error);
            throw error;
        }
    }

    /**
     * Get all patients for a user
     */
    async getPatientsByUser(userId) {
        try {
            const patients = await Patient.findAll({
                where: { user_id: userId },
                order: [['created_at', 'DESC']]
            });

            return {
                success: true,
                data: patients
            };
        } catch (error) {
            logger.error('Error fetching patients:', error);
            throw error;
        }
    }

    /**
     * Get patient by ID
     */
    async getPatientById(patientId, userId) {
        try {
            const patient = await Patient.findOne({
                where: {
                    id: patientId,
                    user_id: userId
                }
            });

            if (!patient) {
                throw new Error('Patient not found');
            }

            return {
                success: true,
                data: patient
            };
        } catch (error) {
            logger.error('Error fetching patient:', error);
            throw error;
        }
    }

    /**
     * Update patient
     */
    async updatePatient(patientId, userId, updateData) {
        try {
            const patient = await Patient.findOne({
                where: {
                    id: patientId,
                    user_id: userId
                }
            });

            if (!patient) {
                throw new Error('Patient not found');
            }

            await patient.update(updateData);

            logger.info('Patient updated successfully:', { patientId });

            return {
                success: true,
                message: 'Patient updated successfully',
                data: patient
            };
        } catch (error) {
            logger.error('Error updating patient:', error);
            throw error;
        }
    }

    /**
     * Delete patient (soft delete)
     */
    async deletePatient(patientId, userId) {
        try {
            const patient = await Patient.findOne({
                where: {
                    id: patientId,
                    user_id: userId
                }
            });

            if (!patient) {
                throw new Error('Patient not found');
            }

            await patient.destroy();

            logger.info('Patient deleted successfully:', { patientId });

            return {
                success: true,
                message: 'Patient deleted successfully'
            };
        } catch (error) {
            logger.error('Error deleting patient:', error);
            throw error;
        }
    }
}

module.exports = new PatientService();
