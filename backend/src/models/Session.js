const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Session = sequelize.define('Session', {
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
    refresh_token: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true
    },
    expires_at: {
        type: DataTypes.DATE,
        allowNull: false
    },
    ip_address: {
        type: DataTypes.INET,
        allowNull: true
    },
    user_agent: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    revoked_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'sessions',
    timestamps: false,
    indexes: [
        { fields: ['user_id'] },
        { fields: ['refresh_token'] },
        { fields: ['expires_at'] }
    ]
});

module.exports = Session;
