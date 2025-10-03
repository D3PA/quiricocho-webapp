const { sequelize } = require('../config/database');
const Player = require('./Player');
const User = require('./User');

// relaciones 
// por ahora no necesitamos relaciones complejas

// sincronizar modelos
const syncModels = async () => {
  try {
    await sequelize.sync({ alter: true }); // alter: true actualiza schema si hay cambios
    console.log('Modelos sincronizados con la base de datos');
  } catch (error) {
    console.error('Error sincronizando modelos:', error);
  }
};

module.exports = {
  sequelize,
  Player,
  User,
  syncModels
};
