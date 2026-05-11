const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PSU School Data API',
      version: '1.0.0',
      description: 'API for managing classrooms and enrollment data for PSU',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
        description: 'Local development server',
      },
    ],
  },
  apis: ['./routes/*.js'], // path to route files with JSDoc annotations
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
