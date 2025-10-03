const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'quiricocho_db',
  process.env.DB_USER || 'quiricocho_user',
  process.env.DB_PASSWORD || 'quiricocho_pass',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    port: process.env.DB_PORT || 3306,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// funcion para probar la conexion
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida correctamente');
    return true;
  } catch (error) {
    console.error('Error conectando a la base de datos:', error.message);
    return false;
  }
};

module.exports = { sequelize, testConnection };