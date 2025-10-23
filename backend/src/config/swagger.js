const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Quiricocho API',
      version: '1.0.0',
      description: 'API para gestion de jugadores de FIFA - Proyecto xAcademy',
      contact: {
        name: 'API Support',
        email: 'support@quiricocho.com'
      }
    },
    servers: [
      {
        url: process.env.API_BASE_URL || 'http://localhost:3000',
        description: 'Servidor de desarrollo'
      }
    ],
    security: [
      {
        bearerAuth: []
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
            potential: {
              type: 'integer',
              description: 'Potencial del jugador (0-100)'
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
            },
            value_eur: {
              type: 'integer',
              description: 'Valor de mercado en euros'
            },
            wage_eur: {
              type: 'integer',
              description: 'Salario semanal en euros'
            },
            preferred_foot: {
              type: 'string',
              enum: ['Right', 'Left'],
              description: 'Pierna hábil'
            },
            weak_foot: {
              type: 'integer',
              minimum: 1,
              maximum: 5,
              description: 'Rating de pierna mala (1-5 estrellas)'
            },
            skill_moves: {
              type: 'integer',
              minimum: 1,
              maximum: 5,
              description: 'Skill moves (1-5 estrellas)'
            },
            player_face_url: {
              type: 'string',
              description: 'URL de la imagen del jugador'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
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
            name: {
              type: 'string',
              example: 'Rodrigo Muñoz'
            },
            is_admin: {
              type: 'boolean',
              example: false
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
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
        },
        ImportResponse: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            imported: { type: 'integer' },
            totalInFile: { type: 'integer' },
            successRate: { type: 'string' },
            warnings: { type: 'string' },
            errorCount: { type: 'integer' }
          }
        },
        TimelineResponse: {
          type: 'object',
          properties: {
            playerName: { type: 'string' },
            skill: { type: 'string' },
            timeline: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'integer' },
                  year: { type: 'string' },
                  value: { type: 'integer' },
                  overall: { type: 'integer' },
                  age: { type: 'integer' }
                }
              }
            },
            totalVersions: { type: 'integer' },
            yearsRange: {
              type: 'object',
              properties: {
                min: { type: 'string' },
                max: { type: 'string' }
              }
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
};

const specs = swaggerJsdoc(options);

const swaggerOptions = {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customCssUrl: 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.9.0/swagger-ui.css',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    tryItOutEnabled: true,
    filter: true,
    spec: specs  
  }
};

const swaggerSetup = swaggerUi.setup(null, swaggerOptions);

module.exports = {
  swaggerUi,
  specs,
  swaggerSetup
};