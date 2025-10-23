// imports y configuraciones
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { syncModels } = require('./models');
const { sequelize } = require('./config/database'); 
const { swaggerUi, swaggerSetup } = require('./config/swagger');
const authRoutes = require('./routes/auth');
const playerRoutes = require('./routes/players');
const { authenticateToken } = require('./middleware/auth');

const app = express();

// middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerSetup);

// middleware que arregla los strings que vienen mal de la DB
// por alguna razon algunos caracteres como acentos se ven mal porque mysql2 los esta interpretando mal.
// esto recorre la respuesta JSON y convierte esos strings a UTF-8 para que lleguen bien al frontend.
// es la unica solucion que encontre por ahora o permanente ya que me atrasa para terminar el proyecto.
/*app.use((req, res, next) => {
  const oldJson = res.json;
  res.json = function (data) {
    function fix(obj) {
      if (typeof obj === 'string') return Buffer.from(obj, 'binary').toString('utf8');
      if (Array.isArray(obj)) return obj.map(fix);
      if (obj && typeof obj === 'object') {
        Object.keys(obj).forEach(k => obj[k] = fix(obj[k]));
        return obj;
      }
      return obj;
    }
    return oldJson.call(this, fix(data));
  };
  next();
});
*/

// rutas publicas
app.get('/api/public/info', (req, res) => {
  res.status(200).json({ 
    message: 'Quiricocho Backend - Sistema de gestion de jugadores de FIFA',
    version: '1.0.0',
    requiresAuth: true,
    authEndpoints: ['/api/auth/login', '/api/auth/register']
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    message: 'Quiricocho Backend se encuentra funcionando',
    timestamp: new Date().toISOString()
  });
});

// rutas de autenticación
app.use('/api/auth', authRoutes);

// rutas de jugadores (protegidas)
app.use('/api/players', authenticateToken, playerRoutes);

// rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// manejo de errores global
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// levantar servidor
const PORT = process.env.PORT || 3000;

syncModels().then(async () => {
  try {
    // forzar UTF-8 en la conexion
    await sequelize.authenticate();
    await sequelize.query("SET NAMES 'utf8mb4';");
    await sequelize.query("SET CHARACTER SET utf8mb4;");
    await sequelize.query("SET character_set_connection = utf8mb4;");
    console.log('Conexión forzada a UTF-8 correctamente');
  } catch (err) {
    console.error('Error forzando UTF-8 en Sequelize:', err.message);
  }

  app.listen(PORT, () => {
    console.log(`El servidor Quiricocho está corriendo en el puerto ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
  });
});
