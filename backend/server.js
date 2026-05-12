const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

const swaggerSpec = require('./config/swagger');
const classroomRoutes = require('./routes/classroomRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');

const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const { verifyJWT, isAdmin } = require('./middleware/authMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes (Admin Only)
app.use('/api/classrooms', verifyJWT, isAdmin, classroomRoutes);
app.use('/api/enrollments', verifyJWT, isAdmin, enrollmentRoutes);
app.use('/api/recommendations', verifyJWT, isAdmin, recommendationRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});