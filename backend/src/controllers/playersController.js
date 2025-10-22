const { validationResult } = require('express-validator');
const { Player, sequelize } = require('../models');
const { Op } = require('sequelize');
const fs = require('fs');

// GET /api/players - listado paginado y filtrado
const getPlayers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      search = '',
      club = '',
      position = '',
      nationality = '',
      fifa_version = '',
      sortBy = 'overall',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;

    // construir condiciones de busqueda MEJORADO
    const whereConditions = {};

    if (search) {
      whereConditions[Op.or] = [
        { long_name: { [Op.like]: `%${search}%` } },
        { club_name: { [Op.like]: `%${search}%` } },
        { player_positions: { [Op.like]: `%${search}%` } },
        { nationality_name: { [Op.like]: `%${search}%` } }
      ];
    }

    // Filtros individuales (para cuando se usan filtros específicos)
    if (club && !search) {
      whereConditions.club_name = { [Op.like]: `%${club}%` };
    }

    if (position && !search) {
      whereConditions.player_positions = { [Op.like]: `%${position}%` };
    }

    if (nationality && !search) {
      whereConditions.nationality_name = { [Op.like]: `%${nationality}%` };
    }

    if (fifa_version) {
      whereConditions.fifa_version = fifa_version;
    }

    let order = [];
    if (sortBy && sortOrder) {
      order = [[sortBy, sortOrder.toUpperCase()]];
    } else {
      order = [['overall', 'DESC']]; 
    }

    // OBTENER TODOS LOS CAMPOS
    const { count, rows: players } = await Player.findAndCountAll({
      where: whereConditions,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: order
    });

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
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

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
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

// PUT /api/players/:id - actualizar jugador (MEJORADO)
const updatePlayer = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Datos de entrada inválidos',
        details: errors.array(),
        code: 'VALIDATION_ERROR'
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    // verificar que el usuario es admin
    if (!req.user || !req.user.is_admin) {
      return res.status(403).json({
        error: 'No tienes permisos para editar jugadores',
        code: 'FORBIDDEN'
      });
    }

    const player = await Player.findByPk(id);

    if (!player) {
      return res.status(404).json({
        error: 'Jugador no encontrado',
        code: 'PLAYER_NOT_FOUND'
      });
    }

    // campos que se pueden actualizar
    const allowedFields = [
      'long_name', 'player_positions', 'club_name', 'nationality_name',
      'overall', 'potential', 'value_eur', 'wage_eur', 'age', 'height_cm', 'weight_kg',
      'preferred_foot', 'weak_foot', 'skill_moves', 'international_reputation',
      'work_rate', 'body_type', 'player_traits',
      // habilidades principales
      'pace', 'shooting', 'passing', 'dribbling', 'defending', 'physic',
      // habilidades específicas
      'attacking_crossing', 'attacking_finishing', 'attacking_heading_accuracy',
      'attacking_short_passing', 'attacking_volleys', 'skill_dribbling',
      'skill_curve', 'skill_fk_accuracy', 'skill_long_passing', 'skill_ball_control',
      'movement_acceleration', 'movement_sprint_speed', 'movement_agility',
      'movement_reactions', 'movement_balance', 'power_shot_power', 'power_jumping',
      'power_stamina', 'power_strength', 'power_long_shots', 'mentality_aggression',
      'mentality_interceptions', 'mentality_positioning', 'mentality_vision',
      'mentality_penalties', 'mentality_composure', 'defending_marking',
      'defending_standing_tackle', 'defending_sliding_tackle', 'goalkeeping_diving',
      'goalkeeping_handling', 'goalkeeping_kicking', 'goalkeeping_positioning',
      'goalkeeping_reflexes', 'goalkeeping_speed'
    ];

    // filtrar solo los campos permitidos
    const filteredUpdateData = {};
    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredUpdateData[key] = updateData[key];
      }
    });

    await player.update(filteredUpdateData);

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

// GET /api/players/export/csv - exportar jugadores a CSV (MEJORADO)
const exportPlayersToCSV = async (req, res) => {
  try {
    const { 
      search = '', 
      club = '', 
      position = '', 
      nationality = '',
      fifa_version = '' 
    } = req.query;

    const whereConditions = {};

    if (search) {
      whereConditions[Op.or] = [
        { long_name: { [Op.like]: `%${search}%` } },
        { club_name: { [Op.like]: `%${search}%` } },
        { player_positions: { [Op.like]: `%${search}%` } },
        { nationality_name: { [Op.like]: `%${search}%` } }
      ];
    }

    if (club && !search) whereConditions.club_name = { [Op.like]: `%${club}%` };
    if (position && !search) whereConditions.player_positions = { [Op.like]: `%${position}%` };
    if (nationality && !search) whereConditions.nationality_name = { [Op.like]: `%${nationality}%` };
    if (fifa_version) whereConditions.fifa_version = fifa_version;

    // OBTENER TODOS LOS CAMPOS POSIBLES
    const players = await Player.findAll({
      where: whereConditions,
      attributes: { 
        exclude: ['createdAt', 'updatedAt']
      },
      limit: 10000 // limite para no sobrecargar
    });

    console.log(`Exportando ${players.length} jugadores con todos los campos`);

    // convertir a CSV usando 'xlsx' - MEJORADO
    const XLSX = require('xlsx');
    
    // preparar datos para CSV
    const csvData = players.map(player => {
      const playerData = player.get({ plain: true });
      
      Object.keys(playerData).forEach(key => {
        if (playerData[key] === null || playerData[key] === undefined) {
          playerData[key] = '';
        } else {
          playerData[key] = String(playerData[key]);
        }
      });
      
      return playerData;
    });

    const worksheet = XLSX.utils.json_to_sheet(csvData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Jugadores_FIFA');
    
    // generar buffer con encoding
    const buffer = XLSX.write(workbook, { 
      type: 'buffer', 
      bookType: 'csv',
      bookSST: false 
    });

    // configurar headers para descarga con encoding correcto
    const filename = `jugadores_fifa_${search || 'completo'}_${new Date().toISOString().split('T')[0]}.csv`;
    
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Length', buffer.length);
    
    res.send(buffer);

  } catch (error) {
    console.error('Error exportando CSV:', error);
    res.status(500).json({
      error: 'Error interno del servidor al exportar CSV',
      code: 'CSV_EXPORT_ERROR',
      details: error.message
    });
  }
};

// GET /api/players/:id/timeline - timeline de habilidades (CON SKILL)
const getPlayerSkillsTimeline = async (req, res) => {
  try {
    const { id } = req.params;
    const { skill = 'overall' } = req.query;

    const validSkills = [
      'overall', 'pace', 'shooting', 'passing', 'dribbling', 'defending', 'physic',
      'attacking_finishing', 'attacking_heading_accuracy', 'skill_dribbling',
      'defending_marking', 'defending_standing_tackle', 'goalkeeping_diving'
    ];

    if (!validSkills.includes(skill)) {
      return res.status(400).json({
        error: 'Skill no válido',
        code: 'INVALID_SKILL'
      });
    }

    // obtener el jugador por ID para saber su nombre
    const currentPlayer = await Player.findByPk(id);
    
    if (!currentPlayer) {
      return res.status(404).json({
        error: 'Jugador no encontrado',
        code: 'PLAYER_NOT_FOUND'
      });
    }

    // buscar todas las versiones por nombre
    const playerVersions = await Player.findAll({
      where: { 
        long_name: currentPlayer.long_name
      },
      attributes: [
        'id', 'fifa_version', 'overall', 'pace', 'shooting', 'passing', 
        'dribbling', 'defending', 'physic', 'age',
        'attacking_finishing', 'attacking_heading_accuracy', 'skill_dribbling',
        'defending_marking', 'defending_standing_tackle', 'goalkeeping_diving'
      ],
      order: [['fifa_version', 'ASC']]
    });

    if (playerVersions.length === 0) {
      return res.status(404).json({
        error: 'No se encontraron versiones del jugador',
        code: 'VERSIONS_NOT_FOUND'
      });
    }

    console.log(`Encontradas ${playerVersions.length} versiones para ${currentPlayer.long_name}`);

    const timeline = playerVersions.map(version => ({
      id: version.id,
      year: version.fifa_version,
      value: version[skill],
      overall: version.overall,
      age: version.age
    }));

    res.status(200).json({
      playerName: currentPlayer.long_name,
      skill,
      timeline,
      totalVersions: playerVersions.length,
      yearsRange: {
        min: playerVersions[0].fifa_version,
        max: playerVersions[playerVersions.length - 1].fifa_version
      }
    });

  } catch (error) {
    console.error('Error obteniendo timeline:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      code: 'TIMELINE_ERROR'
    });
  }
};

// POST /api/players/import/csv - importar jugadores desde CSV
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