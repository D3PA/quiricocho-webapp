const express = require('express');
const { 
  getPlayers, 
  getPlayerById, 
  updatePlayer, 
  createPlayer,
  exportPlayersToCSV,
  getPlayerSkillsTimeline,
  importPlayersFromCSV
} = require('../controllers/playersController');
const { playerUpdateValidation, playerCreateValidation } = require('../middleware/validators');
const { smartUpload } = require('../middleware/upload');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Todas las rutas requieren autenticacion
router.use(authenticateToken);

/**
 * @swagger
 * /api/players:
 *   get:
 *     summary: Obtener listado de jugadores con paginacion y filtros
 *     tags: [Jugadores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numero de pagina
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Cantidad de resultados por pagina
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por nombre de jugador
 *       - in: query
 *         name: club
 *         schema:
 *           type: string
 *         description: Filtrar por club
 *       - in: query
 *         name: position
 *         schema:
 *           type: string
 *         description: Filtrar por posición
 *       - in: query
 *         name: nationality
 *         schema:
 *           type: string
 *         description: Filtrar por nacionalidad
 *     responses:
 *       200:
 *         description: Listado de jugadores
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 players:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Player'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', getPlayers);

/**
 * @swagger
 * /api/players/{id}:
 *   get:
 *     summary: Obtener detalles de un jugador especifico
 *     tags: [Jugadores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del jugador
 *     responses:
 *       200:
 *         description: Detalles del jugador
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 player:
 *                   $ref: '#/components/schemas/Player'
 *       404:
 *         description: Jugador no encontrado
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id', getPlayerById);

/**
 * @swagger
 * /api/players/{id}:
 *   put:
 *     summary: Actualizar informacion de un jugador
 *     tags: [Jugadores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del jugador
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               long_name:
 *                 type: string
 *                 example: "Lionel Messi"
 *               player_positions:
 *                 type: string
 *                 example: "RW, CF"
 *               overall:
 *                 type: integer
 *                 example: 93
 *               age:
 *                 type: integer
 *                 example: 36
 *     responses:
 *       200:
 *         description: Jugador actualizado exitosamente
 *       400:
 *         description: Error de validacion
 *       404:
 *         description: Jugador no encontrado
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:id', playerUpdateValidation, updatePlayer);

/**
 * @swagger
 * /api/players:
 *   post:
 *     summary: Crear un jugador personalizado
 *     tags: [Jugadores]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - long_name
 *               - player_positions
 *               - overall
 *               - age
 *             properties:
 *               long_name:
 *                 type: string
 *                 example: "Rodrigo Muñoz"
 *               player_positions:
 *                 type: string
 *                 example: "CM, CAM"
 *               club_name:
 *                 type: string
 *                 example: "Club Atlético River Plate"
 *               nationality_name:
 *                 type: string
 *                 example: "Argentina"
 *               overall:
 *                 type: integer
 *                 example: 85
 *               age:
 *                 type: integer
 *                 example: 29
 *               pace:
 *                 type: integer
 *                 example: 80
 *               shooting:
 *                 type: integer
 *                 example: 75
 *               passing:
 *                 type: integer
 *                 example: 85
 *     responses:
 *       201:
 *         description: Jugador creado exitosamente
 *       400:
 *         description: Error de validacion
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', playerCreateValidation, createPlayer);

/**
 * @swagger
 * /api/players/export/csv:
 *   get:
 *     summary: Exportar jugadores filtrados a CSV
 *     description: Descarga un archivo CSV con los jugadores aplicando los mismos filtros del listado
 *     tags: [Jugadores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por nombre de jugador
 *       - in: query
 *         name: club
 *         schema:
 *           type: string
 *         description: Filtrar por club
 *       - in: query
 *         name: position
 *         schema:
 *           type: string
 *         description: Filtrar por posicion
 *       - in: query
 *         name: nationality
 *         schema:
 *           type: string
 *         description: Filtrar por nacionalidad
 *     responses:
 *       200:
 *         description: Archivo CSV descargado exitosamente
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/export/csv', exportPlayersToCSV);

/**
 * @swagger
 * /api/players/{id}/timeline:
 *   get:
 *     summary: Obtener linea de tiempo de habilidades de un jugador
 *     description: Devuelve la evolucion de una habilidad especifica a traves de las diferentes versiones de FIFA
 *     tags: [Jugadores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre del jugador (ej. "Lionel Messi")
 *       - in: query
 *         name: skill
 *         required: true
 *         schema:
 *           type: string
 *           enum: [pace, shooting, passing, dribbling, defending, physic, overall]
 *         description: Habilidad a visualizar en la linea de tiempo
 *     responses:
 *       200:
 *         description: Linea de tiempo de habilidades
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 playerName:
 *                   type: string
 *                   example: "Lionel Messi"
 *                 skill:
 *                   type: string
 *                   example: "pace"
 *                 timeline:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       year:
 *                         type: string
 *                         example: "2020"
 *                       value:
 *                         type: integer
 *                         example: 85
 *                       age:
 *                         type: integer
 *                         example: 33
 *                       overall:
 *                         type: integer
 *                         example: 93
 *       400:
 *         description: Parametros invalidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id/timeline', getPlayerSkillsTimeline);

/**
 * @swagger
 * /api/players/import/csv:
 *   post:
 *     summary: Importar jugadores desde archivo CSV
 *     description: Sube un archivo CSV con datos de jugadores y los importa a la base de datos
 *     tags: [Jugadores]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               csvFile:
 *                 type: string
 *                 format: binary
 *                 description: Archivo CSV con datos de jugadores
 *     responses:
 *       201:
 *         description: Jugadores importados exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "1500 jugadores importados exitosamente"
 *                 imported:
 *                   type: integer
 *                   example: 1500
 *                 totalInFile:
 *                   type: integer
 *                   example: 1500
 *                 successRate:
 *                   type: string
 *                   example: "100%"
 *       400:
 *         description: Archivo invalido o faltante
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       413:
 *         description: Archivo demasiado grande (maximo 200MB)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/import/csv', smartUpload, importPlayersFromCSV);

module.exports = router;