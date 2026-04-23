const Report = require('../models/Report');
const aiService = require('../services/ai.service');
const pineconeService = require('../services/pinecone.service');
const emailService = require('../services/email.service');
const redis = require('../config/redis');
const logger = require('../config/logger');
const { z } = require('zod');

// Validation Schema
const reportSchema = z.object({
  latitude: z.string().transform(Number),
  longitude: z.string().transform(Number),
  category: z.string(),
  description: z.string().min(10)
});

/**
 * Submit a new report
 */
exports.createReport = async (req, res) => {
  try {
    // 1. Validate Input
    console.log('Received body:', req.body);
    let validatedData;
    try {
      validatedData = reportSchema.parse(req.body);
    } catch (e) {
      console.error('Validation error:', e.errors);
      return res.status(400).json({ error: 'Validation failed', details: e.errors });
    }

    if (!req.file) {
      console.error('No file uploaded');
      return res.status(400).json({ error: 'Image is required' });
    }

    const { latitude, longitude, category, description } = validatedData;
    const imageUrl = `/uploads/${req.file.filename}`; // In production, upload to S3/Cloudinary

    // 2. AI Processing
    const summary = await aiService.summarizeDescription(description);
    const embedding = await aiService.generateEmbedding(description);

    // 3. Duplicate Detection (Bonus)
    const similarMatches = await pineconeService.findSimilarReports(embedding, 3);
    const isDuplicate = similarMatches.some(match => match.score > 0.95);

    // 4. Save to MongoDB
    const report = new Report({
      user_id: req.auth.userId,
      image_url: imageUrl,
      location: { lat: latitude, lng: longitude },
      category,
      description,
      summary,
      embedding_id: `vec_${Date.now()}` // Temporary ID for Pinecone
    });

    await report.save();

    // 4.1 Broadcast via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.emit('new-report', report);
      console.log('Broadcasted new-report event');
    }

    // 5. Store in Pinecone
    await pineconeService.upsertEmbedding(report.embedding_id, embedding, {
      report_id: report._id.toString(),
      category
    });

    // 6. Clear Redis Cache
    await redis.del('reports:all');

    // 7. Send Email (Async)
    // In a real app, use the email from req.auth.sessionClaims or fetch from Clerk
    // For now, we'll assume a placeholder if not available
    const userEmail = req.auth.claims?.email || 'citizen@example.com'; 
    emailService.sendConfirmationEmail(userEmail, report);

    res.status(201).json({
      message: 'Report submitted successfully',
      report,
      is_duplicate: isDuplicate,
      similar_reports: similarMatches
    });
  } catch (error) {
    logger.error(`Create Report Error: ${error.message}`);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * Get all reports with pagination and filtering
 */
exports.getReports = async (req, res) => {
  try {
    const { page = 1, limit = 10, category } = req.query;
    const cacheKey = `reports:${category || 'all'}:p${page}:l${limit}`;

    // Check Cache
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return res.json(typeof cachedData === 'string' ? JSON.parse(cachedData) : cachedData);
    }

    const query = category ? { category } : {};
    const reports = await Report.find(query)
      .sort({ created_at: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Report.countDocuments(query);

    const response = {
      reports,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    };

    // Store in Cache (Expires in 5 mins)
    await redis.set(cacheKey, JSON.stringify(response), { ex: 300 });

    res.json(response);
  } catch (error) {
    logger.error(`Get Reports Error: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * Get reports in GeoJSON format for Mapbox
 */
exports.getMapReports = async (req, res) => {
  try {
    const cacheKey = 'reports:geojson';
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return res.json(typeof cachedData === 'string' ? JSON.parse(cachedData) : cachedData);
    }

    const reports = await Report.find();
    
    const geoJSON = {
      type: 'FeatureCollection',
      features: reports.map(report => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [report.location.lng, report.location.lat]
        },
        properties: {
          id: report._id,
          category: report.category,
          summary: report.summary,
          image_url: report.image_url,
          status: report.status
        }
      }))
    };

    await redis.set(cacheKey, JSON.stringify(geoJSON), { ex: 600 }); // Cache for 10 mins

    res.json(geoJSON);
  } catch (error) {
    logger.error(`Get Map Reports Error: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * Get user-specific statistics
 */
exports.getUserStats = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { users } = require('@clerk/clerk-sdk-node');
    
    const totalReports = await Report.countDocuments({ user_id: userId });
    const resolvedReports = await Report.countDocuments({ user_id: userId, status: 'resolved' });
    
    const impact = totalReports > 0 ? Math.round((resolvedReports / totalReports) * 100) : 0;

    // Sync to Clerk metadata for faster frontend access
    try {
      await users.updateUserMetadata(userId, {
        publicMetadata: {
          reportsCount: totalReports,
          resolvedCount: resolvedReports,
          impactScore: `${impact}%`
        }
      });
    } catch (clerkErr) {
      logger.error(`Clerk Metadata Sync Error: ${clerkErr.message}`);
    }

    res.json({
      reports: totalReports,
      resolved: resolvedReports,
      impact: `${impact}%`
    });
  } catch (error) {
    logger.error(`Get User Stats Error: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * Get reports submitted by the current user
 */
exports.getMyReports = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const reports = await Report.find({ user_id: userId }).sort({ created_at: -1 });
    res.json(reports);
  } catch (error) {
    logger.error(`Get My Reports Error: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
