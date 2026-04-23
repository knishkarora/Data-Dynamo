import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import multer from 'multer';
import path from 'path';
import { config } from './config/env.js';
import { db } from './services/database.js';
import { redis } from './services/redis.js';
import { authenticate, optionalAuth } from './middleware/auth.js';
import { getFeed, getFeedGeoJSON } from './routes/feed.js';
import { upvote, removeUpvote, checkUpvoteStatus } from './routes/upvote.js';
import { createReport, getReports, getReportById, getReportStats } from './routes/reports.js';
import chatRoutes from './routes/chat.js';
import { getCurrentAqi } from './routes/aqi.js';
const app = express();
// Ensure uploads directory exists
import fs from 'fs';
fs.mkdirSync(config.upload.dir, { recursive: true });
// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors()); // Allow all origins for development
app.use(express.json());
app.use('/uploads', express.static(config.upload.dir));
// File upload config
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, config.upload.dir);
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
    },
});
const upload = multer({
    storage,
    limits: {
        fileSize: config.upload.maxFileSizeMB * 1024 * 1024,
    },
    fileFilter: (_req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp'];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Invalid file type. Use JPEG, PNG, or WebP.'));
        }
    },
});
// Health check
app.get('/health', (_req, res) => {
    res.json({
        status: 'healthy',
        mongodb: db.isConnected() ? 'connected' : 'disconnected',
        redis: redis.client ? 'connected' : 'disconnected',
    });
});
// Public feed routes (no auth required)
app.get('/api/feed', getFeed);
app.get('/api/feed/map', getFeedGeoJSON);
// Report CRUD (auth required for create)
app.get('/api/reports', getReports);
app.get('/api/reports/stats', getReportStats);
app.get('/api/reports/:reportId', getReportById);
app.post('/api/reports', optionalAuth, upload.single('image'), createReport);
// Upvote routes (auth required)
app.post('/api/reports/:reportId/upvote', authenticate, upvote);
app.delete('/api/reports/:reportId/upvote', authenticate, removeUpvote);
app.get('/api/reports/:reportId/upvote', authenticate, checkUpvoteStatus);
// Chat routes
app.use('/api/chat', chatRoutes);
// AQI route
app.get('/api/aqi/current', getCurrentAqi);
// Error handler
app.use((err, _req, res, _next) => {
    console.error('Error:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
});
// 404 handler
app.use((_req, res) => {
    res.status(404).json({ error: 'Not found' });
});
// Start server
const start = async () => {
    try {
        await db.connect();
        await redis.connect();
        app.listen(config.port, () => {
            console.log(`🚀 EcoLens API running on http://localhost:${config.port}`);
        });
    }
    catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
};
start();
