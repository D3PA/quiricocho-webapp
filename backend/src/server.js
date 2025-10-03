const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// middlewares
app.use(cors());
app.use(express.json());

// rutas basicas de prueba
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    message: 'Quiricocho Backend se encuentra funcionando',
    timestamp: new Date().toISOString()
  });
});

// manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// manejo de errores global
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`El servidor Quiricocho esta corriendo en puerto ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
