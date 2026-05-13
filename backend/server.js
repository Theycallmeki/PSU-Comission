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

const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or same-origin)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Root route
app.get('/', (req, res) => {
  res.json({ message: "Welcome to the PSU School Data API", status: "Live", docs: "/api-docs" });
});

// Swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "PSU API Docs"
}));

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