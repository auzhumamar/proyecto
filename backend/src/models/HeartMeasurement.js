const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const HeartMeasurement = sequelize.define('HeartMeasurement', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    patient_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'patients',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    bpm: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 30,
            max: 220,
            isInt: true
        }
    },
    ecg_signal: {
        type: DataTypes.JSONB,
        allowNull: true,
        comment: 'Array of ECG signal values'
    },
    electrode_status: {
        type: DataTypes.JSONB,
        allowNull: true,
        comment: 'Status of electrodes (connected, quality, etc.)'
    },
    measured_at: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
            isDate: true,
            notFuture(value) {
                if (new Date(value) > new Date()) {
                    throw new Error('Measurement timestamp cannot be in the future');
                }
            }
        }
    },
    is_synced: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    sync_error: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'heart_measurements',
    timestamps: false,
    indexes: [
        { fields: ['patient_id'] },
        { fields: ['measured_at'] },
        { fields: ['is_synced'] },
        { fields: ['patient_id', 'measured_at'] }
    ]
});

module.exports = HeartMeasurement;
