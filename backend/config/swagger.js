const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PSU School Data API',
      version: '1.0.0',
      description:
        'RESTful API for managing classrooms and enrollment data for Pangasinan State University. ' +
        'Provides endpoints to retrieve classroom allocations and historical enrollment statistics broken down by grade level and gender.',
      contact: {
        name: 'PSU Development Team',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
        description: 'Local development server',
      },
    ],
    tags: [
      {
        name: 'Classrooms',
        description: 'Operations related to classroom allocations per grade level',
      },
      {
        name: 'Enrollments',
        description: 'Operations related to enrollment data across school years',
      },
    ],
    components: {
      schemas: {
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Error message',
              example: 'Server Error',
            },
          },
        },
      },
    },
  },
  apis: ['./routes/*.js'], // path to route files with JSDoc annotations
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
