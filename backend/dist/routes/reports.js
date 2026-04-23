import { v4 as uuidv4 } from 'uuid';
import { Report } from '../models/report.js';
import { redis } from '../services/redis.js';
const CATEGORIES = ['pothole', 'garbage', 'water', 'electricity', 'road', 'streetlight', 'drainage', 'other'];
export const createReport = async (req, res) => {
    try {
        const userId = req.user?.userId || 'anonymous';
        const { latitude, longitude, category, description } = req.body;
        if (!latitude || !longitude || !category) {
            res.status(400).json({ error: 'latitude, longitude, and category are required' });
            return;
        }
        const latitudeNum = parseFloat(latitude);
        const longitudeNum = parseFloat(longitude);
        if (Number.isNaN(latitudeNum) || Number.isNaN(longitudeNum)) {
            res.status(400).json({ error: 'latitude and longitude must be valid numbers' });
            return;
        }
        if (!CATEGORIES.includes(category)) {
            res.status(400).json({ error: `Invalid category. Must be one of: ${CATEGORIES.join(', ')}` });
            return;
        }
        // Handle file upload
        let imageUrl = '';
        if (req.file) {
            imageUrl = `/uploads/${req.file.filename}`;
        }
        const reportId = uuidv4();
        const report = new Report({
            _id: reportId,
            userId,
            imageUrl,
            location: {
                type: 'Point',
                coordinates: [longitudeNum, latitudeNum],
            },
            latitude: latitudeNum,
            longitude: longitudeNum,
            category,
            description: description || '',
            status: 'pending',
            upvoteCount: 0,
            upvotedBy: [],
        });
        await report.save();
        // Invalidate feed cache
        await redis.deletePattern('feed:*');
        await redis.del('feed:geojson:*');
        res.status(201).json({
            id: report._id,
            userId: report.userId,
            imageUrl: report.imageUrl,
            latitude: report.latitude,
            longitude: report.longitude,
            category: report.category,
            description: report.description,
            status: report.status,
            upvoteCount: report.upvoteCount,
            createdAt: report.createdAt,
        });
    }
    catch (err) {
        console.error('Create report error:', err);
        res.status(500).json({ error: 'Failed to create report' });
    }
};
export const getReports = async (req, res) => {
    try {
        const { page = '1', limit = '20', category, status } = req.query;
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
        const skip = (pageNum - 1) * limitNum;
        const query = {};
        if (category)
            query.category = category;
        if (status)
            query.status = status;
        const [reports, total] = await Promise.all([
            Report.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
            Report.countDocuments(query),
        ]);
        res.json({
            reports,
            total,
            page: pageNum,
            pageSize: limitNum,
            totalPages: Math.ceil(total / limitNum),
        });
    }
    catch (err) {
        console.error('Get reports error:', err);
        res.status(500).json({ error: 'Failed to fetch reports' });
    }
};
export const getReportById = async (req, res) => {
    try {
        const { reportId } = req.params;
        const report = await Report.findById(reportId).lean();
        if (!report) {
            res.status(404).json({ error: 'Report not found' });
            return;
        }
        res.json(report);
    }
    catch (err) {
        console.error('Get report error:', err);
        res.status(500).json({ error: 'Failed to fetch report' });
    }
};
export const getReportStats = async (_req, res) => {
    try {
        const cacheKey = 'reports:stats';
        const cached = await redis.get(cacheKey);
        if (cached) {
            res.json(JSON.parse(cached));
            return;
        }
        const [categoryCounts, total, pending] = await Promise.all([
            Report.aggregate([
                { $group: { _id: '$category', count: { $sum: 1 } } },
            ]),
            Report.countDocuments({}),
            Report.countDocuments({ status: 'pending' }),
        ]);
        const stats = {
            total,
            pending,
            byCategory: Object.fromEntries(categoryCounts.map((c) => [c._id, c.count])),
        };
        await redis.set(cacheKey, JSON.stringify(stats), 60);
        res.json(stats);
    }
    catch (err) {
        console.error('Get stats error:', err);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
};
