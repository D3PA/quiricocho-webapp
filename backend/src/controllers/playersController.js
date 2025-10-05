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

// POST /api/players/import - importar jugadores desde CSV
const importPlayersFromCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'Archivo CSV requerido',
        code: 'FILE_REQUIRED'
      });
    }

    console.log(`Procesando archivo: ${req.file.originalname}`);
    console.log(`Tamaño: ${(req.file.size / 1024 / 1024).toFixed(2)}MB`);
    console.log(`Storage: ${req.file.buffer ? 'Memory' : 'Disk'}`);

    const XLSX = require('xlsx');
    let workbook;

    // manejar tanto memory storage como disk storage
    if (req.file.buffer) {
      // archivo en memoria
      workbook = XLSX.read(req.file.buffer, { 
        type: 'buffer',
        cellDates: true,
        cellText: false,
        cellNF: false 
      });
    } else {
      // archivo en disco - leer desde path
      workbook = XLSX.readFile(req.file.path, {
        cellDates: true,
        cellText: false,
        cellNF: false
      });
    }
    
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const playersData = XLSX.utils.sheet_to_json(worksheet);

    console.log(`Encontrados ${playersData.length} registros en el CSV`);

    // procesar en lotes
    const batchSize = 1000;
    let importedCount = 0;
    let errors = [];

    for (let i = 0; i < playersData.length; i += batchSize) {
      const batch = playersData.slice(i, i + batchSize);
      
      try {
        const processedPlayers = batch.map((player, index) => {
          try {
            return {
              ...player,
              fifa_version: player.fifa_version || '2023',
              fifa_update: player.fifa_update || 'Imported',
              player_face_url: player.player_face_url || 'https://cdn.sofifa.net/players/notfound/0_240.png'
            };
          } catch (error) {
            errors.push(`Error en registro ${i + index}: ${error.message}`);
            return null;
          }
        }).filter(player => player !== null);

        if (processedPlayers.length > 0) {
          const result = await Player.bulkCreate(processedPlayers, {
            validate: false, // desactivar validacion para mejor performance
            ignoreDuplicates: true,
            logging: false
          });

          importedCount += result.length;
        }

        console.log(`Lote ${Math.floor(i/batchSize) + 1}/${Math.ceil(playersData.length/batchSize)}: ${processedPlayers.length} jugadores`);

        // pequeña pausa para no saturar la DB
        if (i + batchSize < playersData.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }

      } catch (batchError) {
        console.error(`Error en lote ${Math.floor(i/batchSize) + 1}:`, batchError.message);
        errors.push(`Lote ${Math.floor(i/batchSize) + 1}: ${batchError.message}`);
      }
    }

    // limpiar archivo temporal si estaba en disco
    if (req.file.path && !req.file.buffer) {
      fs.unlinkSync(req.file.path);
    }

    const response = {
      message: `${importedCount} jugadores importados exitosamente`,
      imported: importedCount,
      totalInFile: playersData.length,
      successRate: ((importedCount / playersData.length) * 100).toFixed(1) + '%'
    };

    if (errors.length > 0) {
      response.warnings = `Se encontraron ${errors.length} errores durante la importación`;
      response.errorCount = errors.length;
    }

    res.status(201).json(response);

  } catch (error) {
    // limpiar archivo temporal en caso de error
    if (req.file && req.file.path && !req.file.buffer) {
      fs.unlinkSync(req.file.path);
    }

    console.error('Error importando CSV:', error);
    res.status(500).json({
      error: 'Error interno del servidor durante importación',
      code: 'CSV_IMPORT_ERROR',
      details: error.message
    });
  }
};

module.exports = {
  getPlayers,
  getPlayerById,
  updatePlayer,
  createPlayer,
  exportPlayersToCSV,
  getPlayerSkillsTimeline,
  importPlayersFromCSV
};