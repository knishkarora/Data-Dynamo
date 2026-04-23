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
    res.json(reports);
  } catch (error) {
    logger.error(`Get My Reports Error: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
/**
 * Vote on a report (Up or Down)
 */
exports.voteReport = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { direction } = req.body; // 'up' or 'down'
    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    if (!report.upvotes) report.upvotes = [];
    if (!report.downvotes) report.downvotes = [];

    const upIndex = report.upvotes.indexOf(userId);
    const downIndex = report.downvotes.indexOf(userId);

    if (direction === 'up') {
      if (upIndex > -1) {
        report.upvotes.splice(upIndex, 1);
      } else {
        report.upvotes.push(userId);
        if (downIndex > -1) report.downvotes.splice(downIndex, 1);
      }
    } else if (direction === 'down') {
      if (downIndex > -1) {
        report.downvotes.splice(downIndex, 1);
      } else {
        report.downvotes.push(userId);
        if (upIndex > -1) report.upvotes.splice(upIndex, 1);
      }
    }

    await report.save();
    res.json({ 
      upvotes: report.upvotes.length, 
      downvotes: report.downvotes.length,
      score: report.upvotes.length - report.downvotes.length,
      userVote: report.upvotes.includes(userId) ? 'up' : report.downvotes.includes(userId) ? 'down' : null
    });
  } catch (error) {
    logger.error(`Vote Error: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * Add an anonymous comment to a report
 */
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Initialize if missing
    if (!report.comments) report.comments = [];

    // Generate a fun anonymous name
    const adjectives = ['Brave', 'Quiet', 'Alert', 'Watchful', 'Eco', 'Green', 'Active'];
    const animals = ['Leopard', 'Eagle', 'Owl', 'Tiger', 'Wolf', 'Deer', 'Falcon'];
    const anonName = `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${animals[Math.floor(Math.random() * animals.length)]}`;

    report.comments.push({
      text,
      anonymous_name: anonName,
      created_at: new Date()
    });

    await report.save();
    res.status(201).json(report.comments[report.comments.length - 1]);
  } catch (error) {
    logger.error(`Comment Error: ${error.message}`);
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
    res.json(report);
  } catch (error) {
    logger.error(`Get Report By ID Error: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

