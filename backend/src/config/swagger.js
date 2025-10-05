const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Quiricocho API',
      version: '1.0.0',
      description: 'API para gestion de jugadores de FIFA - Proyecto XAcademy',
      contact: {
        name: 'API Support',
        email: 'support@quiricocho.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desarrollo'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Player: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID unico del jugador'
            },
            long_name: {
              type: 'string',
              description: 'Nombre completo del jugador'
            },
            player_positions: {
              type: 'string',
              description: 'Posiciones del jugador (ej: "RW, LW")'
            },
            club_name: {
              type: 'string',
              description: 'Nombre del club'
            },
            nationality_name: {
              type: 'string',
              description: 'Nacionalidad'
            },
            overall: {
              type: 'integer',
              description: 'Overall rating (0-100)'
            },
            age: {
              type: 'integer',
              description: 'Edad del jugador'
            },
            fifa_version: {
              type: 'string',
              description: 'Version de FIFA'
            },
            pace: {
              type: 'integer',
              description: 'Velocidad'
            },
            shooting: {
              type: 'integer',
              description: 'Disparo'
            },
            passing: {
              type: 'integer',
              description: 'Pase'
            },
            dribbling: {
              type: 'integer',
              description: 'Regate'
            },
            defending: {
              type: 'integer',
              description: 'Defensa'
            },
            physic: {
              type: 'integer',
              description: 'Fisico'
            }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer'
            },
            email: {
              type: 'string'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Mensaje de error'
            },
            code: {
              type: 'string',
              description: 'Codigo de error especifico'
            },
            details: {
              type: 'array',
              items: {
                type: 'object'
              }
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js'] // archivos que contienen documentacion
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };