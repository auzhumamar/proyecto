const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SyncStatus = sequelize.define('SyncStatus', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    measurement_id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        references: {
            model: 'heart_measurements',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    ubidots_id: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'ID returned by Ubidots API'
    },
    status: {
        type: DataTypes.ENUM('pending', 'synced', 'failed'),
        defaultValue: 'pending'
    },
    retry_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    last_attempt_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    error_message: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'sync_status',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        { fields: ['measurement_id'] },
        { fields: ['status'] },
        { fields: ['retry_count'] }
    ]
});

module.exports = SyncStatus;
