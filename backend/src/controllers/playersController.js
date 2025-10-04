const { validationResult } = require('express-validator');
const { Player, sequelize } = require('../models');
const { Op } = require('sequelize');

// GET /api/players - listado paginado y filtrado
const getPlayers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      club = '',
      position = '',
      nationality = ''
    } = req.query;

    const offset = (page - 1) * limit;

    // construir condiciones de busqueda
    const whereConditions = {};

    if (search) {
      whereConditions.long_name = {
        [Op.like]: `%${search}%`
      };
    }

    if (club) {
      whereConditions.club_name = {
        [Op.like]: `%${club}%`
      };
    }

    if (position) {
      whereConditions.player_positions = {
        [Op.like]: `%${position}%`
      };
    }

    if (nationality) {
      whereConditions.nationality_name = {
        [Op.like]: `%${nationality}%`
      };
    }

    const { count, rows: players } = await Player.findAndCountAll({
      where: whereConditions,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['overall', 'DESC']],
      attributes: [
        'id', 'long_name', 'player_positions', 'club_name', 
        'nationality_name', 'overall', 'age', 'fifa_version'
      ]
    });

    res.status(200).json({
      players,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.error('Error obteniendo jugadores:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      code: 'PLAYERS_FETCH_ERROR'
    });
  }
};

// GET /api/players/:id - detalles de un jugador
const getPlayerById = async (req, res) => {
  try {
    const { id } = req.params;

    const player = await Player.findByPk(id);

    if (!player) {
      return res.status(404).json({
        error: 'Jugador no encontrado',
        code: 'PLAYER_NOT_FOUND'
      });
    }

    res.status(200).json({
      player
    });

  } catch (error) {
    console.error('Error obteniendo jugador:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      code: 'PLAYER_FETCH_ERROR'
    });
  }
};

// PUT /api/players/:id - actualizar jugador
const updatePlayer = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Datos de entrada invalidos',
        details: errors.array(),
        code: 'VALIDATION_ERROR'
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    const player = await Player.findByPk(id);

    if (!player) {
      return res.status(404).json({
        error: 'Jugador no encontrado',
        code: 'PLAYER_NOT_FOUND'
      });
    }

    await player.update(updateData);

    res.status(200).json({
      message: 'Jugador actualizado exitosamente',
      player
    });

  } catch (error) {
    console.error('Error actualizando jugador:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      code: 'PLAYER_UPDATE_ERROR'
    });
  }
};

// POST /api/players - crear jugador personalizado
const createPlayer = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Datos de entrada invalidos',
        details: errors.array(),
        code: 'VALIDATION_ERROR'
      });
    }

    const playerData = {
      ...req.body,
      fifa_version: '2023',
      fifa_update: 'Custom',
      player_face_url: 'https://cdn.sofifa.net/players/notfound/0_240.png'
    };

    const player = await Player.create(playerData);

    res.status(201).json({
      message: 'Jugador creado exitosamente',
      player
    });

  } catch (error) {
    console.error('Error creando jugador:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      code: 'PLAYER_CREATE_ERROR'
    });
  }
};

// GET /api/players/export - exportar jugadores a CSV
const exportPlayersToCSV = async (req, res) => {
  try {
    const { search = '', club = '', position = '', nationality = '' } = req.query;

    // construir condiciones (igual que getPlayers) 
    const whereConditions = {};
    if (search) whereConditions.long_name = { [Op.like]: `%${search}%` };
    if (club) whereConditions.club_name = { [Op.like]: `%${club}%` };
    if (position) whereConditions.player_positions = { [Op.like]: `%${position}%` };
    if (nationality) whereConditions.nationality_name = { [Op.like]: `%${nationality}%` };

    const players = await Player.findAll({
      where: whereConditions,
      attributes: [
        'long_name', 'player_positions', 'club_name', 'nationality_name',
        'overall', 'age', 'pace', 'shooting', 'passing', 'dribbling', 'defending', 'physic'
      ]
    });

    // convertir a CSV usando 'xlsx'
    const XLSX = require('xlsx');
    const worksheet = XLSX.utils.json_to_sheet(players);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Jugadores');
    
    // generar buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'csv' });

    // configurar headers para descarga
    res.setHeader('Content-Disposition', 'attachment; filename=jugadores.csv'); 
    res.setHeader('Content-Type', 'text/csv'); 
    res.send(buffer);

  } catch (error) {
    console.error('Error exportando CSV:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      code: 'CSV_EXPORT_ERROR'
    });
  }
};

// GET /api/players/:id/timeline - timeline de habilidades
const getPlayerSkillsTimeline = async (req, res) => {
  try {
    const { id } = req.params;
    const { skill } = req.query; // ejemplo: 'pace', 'shooting', etc.

    if (!skill) {
      return res.status(400).json({
        error: 'Parametro skill requerido',
        code: 'SKILL_REQUIRED'
      });
    }

    const validSkills = ['pace', 'shooting', 'passing', 'dribbling', 'defending', 'physic', 'overall'];
    if (!validSkills.includes(skill)) {
      return res.status(400).json({
        error: 'Skill no valido',
        code: 'INVALID_SKILL'
      });
    }

    const playerVersions = await Player.findAll({
      where: { 
        long_name: { [Op.like]: `%${id}%` } // buscar por nombre (simplificado)
      },
      attributes: ['fifa_version', 'overall', 'pace', 'shooting', 'passing', 'dribbling', 'defending', 'physic', 'age'],
      order: [['fifa_version', 'ASC']]
    });

    const timeline = playerVersions.map(version => ({
      year: version.fifa_version,
      value: version[skill],
      age: version.age,
      overall: version.overall
    }));

    res.status(200).json({
      playerName: id,
      skill,
      timeline
    });

  } catch (error) {
    console.error('Error obteniendo timeline:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      code: 'TIMELINE_ERROR'
    });
  }
};

module.exports = {
  getPlayers,
  getPlayerById,
  updatePlayer,
  createPlayer,
  exportPlayersToCSV,
  getPlayerSkillsTimeline
};