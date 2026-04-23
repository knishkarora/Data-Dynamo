import dotenv from 'dotenv';
dotenv.config();
export const config = {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '8000', 10),
    mongodb: {
        uri: process.env.MONGODB_URI || '',
        dbName: process.env.MONGODB_DB_NAME || 'climx',
    },
    redis: {
        url: process.env.REDIS_URL || '',
        restUrl: process.env.UPSTASH_REDIS_REST_URL || '',
        restToken: process.env.UPSTASH_REDIS_REST_TOKEN || '',
    },
    clerk: {
        secretKey: process.env.CLERK_SECRET_KEY || '',
    },
    mapbox: {
        apiKey: process.env.MAPBOX_API_KEY || '',
    },
    upload: {
        dir: process.env.UPLOAD_DIR || './uploads',
        maxFileSizeMB: parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10),
    },
    corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:3000'],
    groq: {
        apiKey: process.env.GROQ_API_KEY || '',
        model: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
        maxTokens: parseInt(process.env.GROQ_MAX_TOKENS || '1024', 10),
    },
    aqi: {
        googleApiKey: process.env.GOOGLE_AIR_QUALITY_API_KEY || '',
        defaultLat: parseFloat(process.env.DEFAULT_AQI_LAT || '31.1471'),
        defaultLng: parseFloat(process.env.DEFAULT_AQI_LNG || '75.3412'),
    },
    chat: {
        cacheTTL: parseInt(process.env.CHAT_CACHE_TTL || '3600', 10),
        rateLimitMax: parseInt(process.env.CHAT_RATE_LIMIT_MAX || '20', 10),
        rateLimitWindow: parseInt(process.env.CHAT_RATE_LIMIT_WINDOW || '60', 10),
    },
};
