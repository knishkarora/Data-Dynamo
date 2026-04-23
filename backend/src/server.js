require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');
const logger = require('./config/logger');
const reportRoutes = require('./routes/report.routes');
const aiRoutes = require('./routes/ai.routes');
const aqiRoutes = require('./routes/aqi.routes');
const waterRoutes = require('./routes/water.routes');

const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : '*',
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Make io accessible to routes
app.set('io', io);

// Connect to Database
connectDB();

// Verify Environment Variables
logger.info(`Clerk Publishable Key: ${process.env.CLERK_PUBLISHABLE_KEY ? 'Loaded' : 'MISSING'}`);
logger.info(`Clerk Secret Key: ${process.env.CLERK_SECRET_KEY ? 'Loaded' : 'MISSING'}`);
logger.info(`CORS Origins: ${process.env.CORS_ORIGINS}`);

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: false, // Allow images to be served
}));
app.use(cors({
  origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : '*',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static Folder for Uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/reports', reportRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/aqi', aqiRoutes);
app.use('/api/water', waterRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Socket.io connection
io.on('connection', (socket) => {
  logger.info(`User connected: ${socket.id}`);
  socket.on('disconnect', () => {
    logger.info(`User disconnected: ${socket.id}`);
  });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 8002;

server.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
