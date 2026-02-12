const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const VerificationCode = sequelize.define('VerificationCode', {
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
    code: {
        type: DataTypes.STRING(6),
        allowNull: false
    },
    expires_at: {
        type: DataTypes.DATE,
        allowNull: false
    },
    attempts: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    is_used: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'verification_codes',
    timestamps: false,
    indexes: [
        { fields: ['user_id'] },
        { fields: ['code'] },
        { fields: ['expires_at'] }
    ]
});

module.exports = VerificationCode;
