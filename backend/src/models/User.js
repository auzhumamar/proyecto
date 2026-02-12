const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password_hash: {
        type: DataTypes.STRING,
        allowNull: true // Nullable for OAuth users
    },
    google_id: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    },
    is_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    role: {
        type: DataTypes.ENUM('admin', 'doctor', 'user'),
        defaultValue: 'user'
    },
    full_name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    birth_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    gender: {
        type: DataTypes.ENUM('male', 'female', 'other', 'prefer_not_to_say'),
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
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        { fields: ['email'] },
        { fields: ['google_id'] }
    ]
});

module.exports = User;
