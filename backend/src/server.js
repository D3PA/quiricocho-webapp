// imports y configuraciones
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { syncModels } = require('./models');
const { swaggerUi, specs } = require('./config/swagger');
const authRoutes = require('./routes/auth');
const playerRoutes = require('./routes/players');
const { authenticateToken } = require('./middleware/auth');

// inicializacion de express y middlewares
const app = express();

app.use(cors());
app.use(express.json());

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

// Swagger para desarrollo (publica)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs)); 

// rutas de autenticacion (publica)
app.use('/api/auth', authRoutes);

// rutas de jugadores (rutas protegidas, requieren autenticacion)
app.use('/api/players', authenticateToken, playerRoutes);

// manejo de rutas no encontradas
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

syncModels().then(() => {
  app.listen(PORT, () => {
    console.log(`El servidor Quiricocho esta corriendo en el puerto ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
  });
});
