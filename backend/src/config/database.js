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
    define: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_0900_ai_ci', 
      timestamps: false
    },
    dialectOptions: {
      charset: 'utf8mb4',
      supportBigNumbers: true,
      bigNumberStrings: true
    },
    timezone: '-03:00'
  }
);

const forceUTF8 = async () => {
  try {
    await sequelize.query("SET NAMES 'utf8mb4';");
    await sequelize.query("SET CHARACTER SET utf8mb4;");
    await sequelize.query("SET character_set_connection = utf8mb4;");
    console.log('Conexion forzada a UTF-8 correctamente');
  } catch (error) {
    console.error('Error forzando UTF-8 en la conexion:', error.message);
  }
};

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    await forceUTF8();
    console.log('Conexion a la base de datos establecida correctamente');
    return true;
  } catch (error) {
    console.error('Error conectando a la base de datos:', error.message);
    return false;
  }
};

module.exports = { sequelize, testConnection };