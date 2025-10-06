const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [3, 255]
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  is_admin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'users',
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      // solo encriptar si no esta ya encriptado
      if (!user.password.startsWith('$2a$')) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password') && !user.password.startsWith('$2a$')) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    }
  }
});

// metodo para validar password
User.prototype.validatePassword = async function(password) {
  // si la password en DB esta encriptada, usar bcrypt
  if (this.password.startsWith('$2a$')) {
    return await bcrypt.compare(password, this.password);
  }
  // si esta en texto plano, comparar directamente
  return password === this.password;
};

module.exports = User;