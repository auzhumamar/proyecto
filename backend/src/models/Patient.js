const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Patient = sequelize.define('Patient', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    age: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: 0,
            max: 150
        }
    },
    gender: {
        type: DataTypes.ENUM('male', 'female', 'other'),
        allowNull: true
    },
    medical_history: {
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
    },
    deleted_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'patients',
    timestamps: true,
    paranoid: true, // Soft delete
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    indexes: [
        { fields: ['user_id'] }
    ]
});

module.exports = Patient;
