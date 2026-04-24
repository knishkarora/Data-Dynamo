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
  severity: z.string().optional().default('medium'),
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

    const { latitude, longitude, category, severity, description } = validatedData;
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
      severity,
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
    const { createClerkClient } = require('@clerk/clerk-sdk-node');
    const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
    
    let userEmail = req.auth.claims?.email;
    
    if (!userEmail) {
      try {
        const user = await clerkClient.users.getUser(req.auth.userId);
        userEmail = user.emailAddresses[0]?.emailAddress;
        console.log('Fetched email from Clerk:', userEmail);
      } catch (clerkErr) {
        console.error('Failed to fetch user email from Clerk:', clerkErr.message);
      }
    }

    userEmail = userEmail || 'citizen@example.com';
    console.log(`[CRITICAL DEBUG] Attempting to send confirmation email to: ${userEmail}`);
    try {
      await emailService.sendConfirmationEmail(userEmail, report);
      console.log(`[CRITICAL DEBUG] emailService.sendConfirmationEmail call finished`);
    } catch (emailErr) {
      console.error(`[CRITICAL DEBUG] emailService.sendConfirmationEmail CRASHED:`, emailErr);
    }

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
 * Helper to enrich reports with real-time data from Redis using a pipeline for performance
 */
const enrichReportsWithRedis = async (reports, userId) => {
  if (!reports || reports.length === 0) return [];

  try {
    const pipeline = redis.pipeline();
    
    reports.forEach(report => {
      const reportId = report._id.toString();
      pipeline.smembers(`votes:${reportId}:up`);
      pipeline.smembers(`votes:${reportId}:down`);
      pipeline.lrange(`comments:${reportId}`, 0, -1);
    });

    const results = await pipeline.exec();
    
    return reports.map((report, index) => {
      // @upstash/redis pipeline.exec() returns results directly in an array
      const offset = index * 3;
      const redisUpvotes = results[offset] || [];
      const redisDownvotes = results[offset + 1] || [];
      const redisComments = results[offset + 2] || [];

      // Convert Redis comments (JSON strings) to objects, with safety check
      const parsedRedisComments = redisComments.map(c => {
        try {
          return typeof c === 'string' ? JSON.parse(c) : c;
        } catch (e) {
          logger.warn(`Failed to parse comment from Redis: ${c}`);
          return null;
        }
      }).filter(c => c !== null);

      const dbReport = report.toObject ? report.toObject() : report;
      const dbUpvotes = Array.isArray(dbReport.upvotes) ? dbReport.upvotes : [];
      const dbDownvotes = Array.isArray(dbReport.downvotes) ? dbReport.downvotes : [];
      const dbComments = Array.isArray(dbReport.comments) ? dbReport.comments : [];

      // Use Redis data if it exists, otherwise fallback to DB
      const finalUpvotes = redisUpvotes.length > 0 ? redisUpvotes : dbUpvotes;
      const finalDownvotes = redisDownvotes.length > 0 ? redisDownvotes : dbDownvotes;
      const finalComments = [...dbComments, ...parsedRedisComments];

      return {
        ...dbReport,
        upvotes: finalUpvotes,
        downvotes: finalDownvotes,
        comments: finalComments
      };
    });
  } catch (error) {
    logger.error(`Redis Enrichment Error: ${error.message}`, { stack: error.stack });
    // Fallback: return original reports if Redis fails
    return reports.map(r => r.toObject ? r.toObject() : r);
  }
};

/**
 * Get all reports with pagination and filtering
 */
exports.getReports = async (req, res) => {
  try {
    const { page = 1, limit = 10, category } = req.query;
    const userId = req.auth?.userId;

    const query = category ? { category } : {};
    const reports = await Report.find(query)
      .sort({ created_at: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Report.countDocuments(query);

    // Enrich with Redis data
    const enrichedReports = await enrichReportsWithRedis(reports, userId);

    const response = {
      reports: enrichedReports,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    };

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

    res.json(geoJSON);
  } catch (error) {
    logger.error(`Get Map Reports Error: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getUserStats = async (req, res) => {
  try {
    const { clerkClient } = require('@clerk/clerk-sdk-node');
    const userId = req.auth.userId;
    
    const totalReports = await Report.countDocuments({ user_id: userId });
    const resolvedReports = await Report.countDocuments({ user_id: userId, status: 'resolved' });
    
    const impact = totalReports > 0 ? Math.round((resolvedReports / totalReports) * 100) : 0;

    // Calculate badges based on categories
    const categories = await Report.distinct('category', { user_id: userId });
    const badges = [];
    if (categories.some(c => ['stubble_burning', 'garbage_burning', 'industrial_burning', 'extreme_aqi'].includes(c))) {
      badges.push('Air Watcher');
    }
    if (categories.some(c => ['water_misuse', 'water_pollution'].includes(c))) {
      badges.push('River Guard');
    }
    if (categories.some(c => ['green_cover_loss', 'fake_plantation'].includes(c))) {
      badges.push('Green Guardian');
    }
    if (categories.some(c => ['illegal_dumping', 'toxic_waste', 'govt_negligence'].includes(c))) {
      badges.push('Ground Defender');
    }
    if (totalReports >= 10) {
      badges.push('Top Contributor');
    }

    // Sync to Clerk metadata for faster frontend access
    try {
      await clerkClient.users.updateUserMetadata(userId, {
        publicMetadata: {
          reportsCount: totalReports,
          resolvedCount: resolvedReports,
          impactScore: `${impact}%`,
          badges: badges
        }
      });
    } catch (clerkErr) {
      logger.error(`Clerk Metadata Sync Error: ${clerkErr.message}`);
    }

    res.json({
      reports: totalReports,
      resolved: resolvedReports,
      impact: `${impact}%`,
      badges: badges
    });
  } catch (error) {
    logger.error(`Get User Stats Error: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * Get report counts by severity and category for filters
 */
exports.getReportCounts = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const counts = await Report.aggregate([
      {
        $facet: {
          bySeverity: [
            { $group: { _id: "$severity", count: { $sum: 1 } } }
          ],
          byCategory: [
            { $group: { _id: "$category", count: { $sum: 1 } } }
          ],
          todayCount: [
            { $match: { created_at: { $gte: today } } },
            { $count: "count" }
          ],
          resolvedCount: [
            { $match: { status: "resolved" } },
            { $count: "count" }
          ],
          totalCount: [
            { $count: "count" }
          ]
        }
      }
    ]);

    const result = {
      severity: { high: 0, medium: 0, low: 0 },
      categories: {},
      today: counts[0].todayCount[0]?.count || 0,
      total: counts[0].totalCount[0]?.count || 0,
      resolvedPercent: counts[0].totalCount[0]?.count > 0 
        ? Math.round((counts[0].resolvedCount[0]?.count || 0) / counts[0].totalCount[0].count * 100) 
        : 0
    };

    counts[0].bySeverity.forEach(s => {
      if (s._id) result.severity[s._id] = s.count;
    });

    counts[0].byCategory.forEach(c => {
      if (c._id) result.categories[c._id] = c.count;
    });

    res.json(result);
  } catch (error) {
    logger.error(`Get Report Counts Error: ${error.message}`);
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
    const enriched = await enrichReportsWithRedis(reports, userId);
    res.json(enriched);
  } catch (error) {
    logger.error(`Get My Reports Error: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
/**
 * Vote on a report (Up or Down) - REDIS FIRST
 */
exports.voteReport = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { direction } = req.body;
    const reportId = req.params.id;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    
    const upKey = `votes:${reportId}:up`;
    const downKey = `votes:${reportId}:down`;

    // 1. Get current Redis state if it exists, otherwise initialize from DB
    let hasUpvoted = await redis.sismember(upKey, userId);
    let hasDownvoted = await redis.sismember(downKey, userId);

    // If Redis doesn't have the member, it *might* be in DB. 
    // But for a fast social feed, we can assume that if it's not in Redis, 
    // we should check DB once OR just sync DB -> Redis on first interaction.
    // To keep it simple and ultra-fast, we'll sync DB to Redis if Redis keys don't exist.
    const redisExists = await redis.exists(upKey) || await redis.exists(downKey);
    
    if (!redisExists) {
      const report = await Report.findById(reportId).select('upvotes downvotes').lean();
      if (report) {
        if (report.upvotes?.length) await redis.sadd(upKey, ...report.upvotes.map(id => id.toString()));
        if (report.downvotes?.length) await redis.sadd(downKey, ...report.downvotes.map(id => id.toString()));
        hasUpvoted = report.upvotes?.map(id => id.toString()).includes(userId);
        hasDownvoted = report.downvotes?.map(id => id.toString()).includes(userId);
      }
    }

    // 2. Perform Toggle Logic in Redis
    if (direction === 'up') {
      if (hasUpvoted) {
        await redis.srem(upKey, userId);
      } else {
        await redis.sadd(upKey, userId);
        await redis.srem(downKey, userId);
      }
    } else {
      if (hasDownvoted) {
        await redis.srem(downKey, userId);
      } else {
        await redis.sadd(downKey, userId);
        await redis.srem(upKey, userId);
      }
    }

    // 3. Mark for sync
    await redis.sadd('pending_sync:reports', reportId);

    // 4. Return new state immediately
    const [finalUp, finalDown] = await Promise.all([
      redis.smembers(upKey),
      redis.smembers(downKey)
    ]);

    res.json({
      upvotes: finalUp.length,
      downvotes: finalDown.length,
      score: finalUp.length - finalDown.length,
      userVote: finalUp.includes(userId) ? 'up' : finalDown.includes(userId) ? 'down' : null
    });
  } catch (error) {
    logger.error(`Vote Error (Redis): ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * Add an anonymous comment - REDIS FIRST
 */
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const reportId = req.params.id;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Comment text cannot be empty' });
    }

    // Generate anon name
    const adjectives = ['Brave', 'Quiet', 'Alert', 'Watchful', 'Eco', 'Green', 'Active', 'Swift', 'Bright'];
    const animals = ['Leopard', 'Eagle', 'Owl', 'Tiger', 'Wolf', 'Deer', 'Falcon', 'Panda', 'Lion'];
    const anonName = `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${animals[Math.floor(Math.random() * animals.length)]}`;

    const newComment = {
      text: text.trim(),
      anonymous_name: anonName,
      created_at: new Date()
    };

    // Store in Redis List
    await redis.rpush(`comments:${reportId}`, JSON.stringify(newComment));
    
    // Mark for sync
    await redis.sadd('pending_sync:reports', reportId);

    res.status(201).json(newComment);
  } catch (error) {
    logger.error(`Comment Error (Redis): ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * Get a single report by ID
 */
exports.getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    const enriched = await enrichReportsWithRedis([report], req.auth?.userId);
    res.json(enriched[0]);
  } catch (error) {
    logger.error(`Get Report By ID Error: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

