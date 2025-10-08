const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Player = sequelize.define('Player', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  fifa_version: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fifa_update: {
    type: DataTypes.STRING,
    allowNull: false
  },
  player_face_url: {
    type: DataTypes.STRING,
    allowNull: false
  },
  long_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  player_positions: {
    type: DataTypes.STRING,
    allowNull: false
  },
  club_name: {
    type: DataTypes.STRING
  },
  nationality_name: {
    type: DataTypes.STRING
  },
  overall: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  potential: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  value_eur: {
    type: DataTypes.INTEGER
  },
  wage_eur: {
    type: DataTypes.INTEGER
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  height_cm: {
    type: DataTypes.INTEGER
  },
  weight_kg: {
    type: DataTypes.INTEGER
  },
  preferred_foot: {
    type: DataTypes.STRING
  },
  weak_foot: {
    type: DataTypes.INTEGER
  },
  skill_moves: {
    type: DataTypes.INTEGER
  },
  international_reputation: {
    type: DataTypes.INTEGER
  },
  work_rate: {
    type: DataTypes.STRING
  },
  body_type: {
    type: DataTypes.STRING
  },
  // habilidades principales
  pace: {
    type: DataTypes.INTEGER
  },
  shooting: {
    type: DataTypes.INTEGER
  },
  passing: {
    type: DataTypes.INTEGER
  },
  dribbling: {
    type: DataTypes.INTEGER
  },
  defending: {
    type: DataTypes.INTEGER
  },
  physic: {
    type: DataTypes.INTEGER
  },
  // habilidades especificas de ataque
  attacking_crossing: {
    type: DataTypes.INTEGER
  },
  attacking_finishing: {
    type: DataTypes.INTEGER
  },
  attacking_heading_accuracy: {
    type: DataTypes.INTEGER
  },
  attacking_short_passing: {
    type: DataTypes.INTEGER
  },
  attacking_volleys: {
    type: DataTypes.INTEGER
  },
  // habilidades especificas de skill
  skill_dribbling: {
    type: DataTypes.INTEGER
  },
  skill_curve: {
    type: DataTypes.INTEGER
  },
  skill_fk_accuracy: {
    type: DataTypes.INTEGER
  },
  skill_long_passing: {
    type: DataTypes.INTEGER
  },
  skill_ball_control: {
    type: DataTypes.INTEGER
  },
  // movimiento
  movement_acceleration: {
    type: DataTypes.INTEGER
  },
  movement_sprint_speed: {
    type: DataTypes.INTEGER
  },
  movement_agility: {
    type: DataTypes.INTEGER
  },
  movement_reactions: {
    type: DataTypes.INTEGER
  },
  movement_balance: {
    type: DataTypes.INTEGER
  },
  // power
  power_shot_power: {
    type: DataTypes.INTEGER
  },
  power_jumping: {
    type: DataTypes.INTEGER
  },
  power_stamina: {
    type: DataTypes.INTEGER
  },
  power_strength: {
    type: DataTypes.INTEGER
  },
  power_long_shots: {
    type: DataTypes.INTEGER
  },
  // mentalidad
  mentality_aggression: {
    type: DataTypes.INTEGER
  },
  mentality_interceptions: {
    type: DataTypes.INTEGER
  },
  mentality_positioning: {
    type: DataTypes.INTEGER
  },
  mentality_vision: {
    type: DataTypes.INTEGER
  },
  mentality_penalties: {
    type: DataTypes.INTEGER
  },
  mentality_composure: {
    type: DataTypes.INTEGER
  },
  // defensa
  defending_marking: {
    type: DataTypes.INTEGER
  },
  defending_standing_tackle: {
    type: DataTypes.INTEGER
  },
  defending_sliding_tackle: {
    type: DataTypes.INTEGER
  },
  // arquero
  goalkeeping_diving: {
    type: DataTypes.INTEGER
  },
  goalkeeping_handling: {
    type: DataTypes.INTEGER
  },
  goalkeeping_kicking: {
    type: DataTypes.INTEGER
  },
  goalkeeping_positioning: {
    type: DataTypes.INTEGER
  },
  goalkeeping_reflexes: {
    type: DataTypes.INTEGER
  },
  goalkeeping_speed: {
    type: DataTypes.INTEGER
  },
  player_traits: {
    type: DataTypes.STRING
  }
}, {
  tableName: 'players',
  timestamps: false, // porque la tabla original no tiene created_at/updated_at
  charset: 'utf8mb4',
  collate: 'utf8mb4_0900_ai_ci'
});

module.exports = Player;