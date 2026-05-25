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
const aiRoutes = require('./routes/aiRoutes');
const userRoutes = require('./routes/userRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const pdfRoutes       = require('./routes/pdfRoutes');
const { verifyJWT, isAdmin } = require('./middleware/authMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
    const isWhitelisted = allowedOrigins.includes(origin);
    const isVercel = origin.endsWith('.vercel.app');
    const isLocal = origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1');

    if (isWhitelisted || isVercel || isLocal) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], // ← added PATCH
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
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

// Keep-alive route for cron jobs
app.get('/api/keep-alive', (req, res) => {
  res.json({ status: "alive", timestamp: new Date() });
});

// Protected routes
app.use('/api/classrooms', verifyJWT, classroomRoutes);
app.use('/api/enrollments', verifyJWT, enrollmentRoutes);
app.use('/api/recommendations', verifyJWT, recommendationRoutes);
app.use('/api/analytics', verifyJWT, analyticsRoutes);
app.use('/api/ai', verifyJWT, aiRoutes);
app.use('/api/pdf', verifyJWT, pdfRoutes);

// Admin Only routes
app.use('/api/users', verifyJWT, isAdmin, userRoutes);

// Self-pinging logic to keep the instance warm
const SELF_PING_URL = "https://psu-comission.onrender.com/api/keep-alive";
setInterval(() => {
  fetch(SELF_PING_URL)
    .then(() => console.log('Self-ping successful'))
    .catch(err => console.error('Self-ping failed:', err.message));
}, 14 * 60 * 1000);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});