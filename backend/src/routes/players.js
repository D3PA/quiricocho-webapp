const express = require('express');
const { 
  getPlayers, 
  getPlayerById, 
  updatePlayer, 
  createPlayer 
} = require('../controllers/playersController');
const { playerUpdateValidation, playerCreateValidation } = require('../middleware/validators');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// todas las rutas requieren autenticacion
router.use(authenticateToken);

// GET /api/players - listado con paginacion y filtros
router.get('/', getPlayers);

// GET /api/players/:id - detalles de jugador
router.get('/:id', getPlayerById);

// PUT /api/players/:id - actualizar jugador
router.put('/:id', playerUpdateValidation, updatePlayer);

// POST /api/players - crear jugador personalizado
router.post('/', playerCreateValidation, createPlayer);

module.exports = router;