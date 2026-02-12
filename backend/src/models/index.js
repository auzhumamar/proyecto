const { sequelize } = require('../config/database');
const User = require('./User');
const VerificationCode = require('./VerificationCode');
const Patient = require('./Patient');
const HeartMeasurement = require('./HeartMeasurement');
const Session = require('./Session');
const SyncStatus = require('./SyncStatus');

// Define associations
User.hasMany(VerificationCode, { foreignKey: 'user_id', as: 'verificationCodes' });
VerificationCode.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Patient, { foreignKey: 'user_id', as: 'patients' });
Patient.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Patient.hasMany(HeartMeasurement, { foreignKey: 'patient_id', as: 'measurements' });
HeartMeasurement.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

User.hasMany(Session, { foreignKey: 'user_id', as: 'sessions' });
Session.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

HeartMeasurement.hasOne(SyncStatus, { foreignKey: 'measurement_id', as: 'syncStatus' });
SyncStatus.belongsTo(HeartMeasurement, { foreignKey: 'measurement_id', as: 'measurement' });

// Sync all models
const syncDatabase = async (force = false) => {
    try {
        // In development, we use sync() without alter:true if it's causing issues with constraints.
        // For production, migrations should be used.
        await sequelize.sync({ force });
        console.log('✅ Database synchronized successfully');
    } catch (error) {
        console.error('❌ Error synchronizing database:', error);
        throw error;
    }
};

module.exports = {
    sequelize,
    User,
    VerificationCode,
    Patient,
    HeartMeasurement,
    Session,
    SyncStatus,
    syncDatabase
};
