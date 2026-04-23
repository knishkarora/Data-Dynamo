import { Report } from '../models/report.js';
import { redis } from '../services/redis.js';
// Rate limit: max 10 upvotes per minute per user
const UPVOTE_RATE_LIMIT_KEY = (userId) => `rate:upvote:${userId}`;
const UPVOTE_RATE_LIMIT = 10;
const UPVOTE_WINDOW_SECONDS = 60;
export const upvote = async (req, res) => {
    try {
        const { reportId } = req.params;
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }
        // Rate limiting check
        const rateKey = UPVOTE_RATE_LIMIT_KEY(userId);
        const currentCount = await redis.incr(rateKey);
        if (currentCount === 1) {
            await redis.expire(rateKey, UPVOTE_WINDOW_SECONDS);
        }
        if (currentCount > UPVOTE_RATE_LIMIT) {
            res.status(429).json({ error: 'Too many upvotes. Please slow down.' });
            return;
        }
        // Find report
        const report = await Report.findById(reportId);
        if (!report) {
            res.status(404).json({ error: 'Report not found' });
            return;
        }
        // Check if already upvoted
        if (report.upvotedBy.includes(userId)) {
            res.status(400).json({ error: 'Already upvoted this report' });
            return;
        }
        // Add upvote
        report.upvoteCount += 1;
        report.upvotedBy.push(userId);
        await report.save();
        // Invalidate feed cache
        await invalidateFeedCache();
        res.json({
            success: true,
            upvoteCount: report.upvoteCount,
            hasUpvoted: true,
        });
    }
    catch (err) {
        console.error('Upvote error:', err);
        res.status(500).json({ error: 'Failed to upvote' });
    }
};
export const removeUpvote = async (req, res) => {
    try {
        const { reportId } = req.params;
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }
        const report = await Report.findById(reportId);
        if (!report) {
            res.status(404).json({ error: 'Report not found' });
            return;
        }
        // Check if user has upvoted
        const upvotedIndex = report.upvotedBy.indexOf(userId);
        if (upvotedIndex === -1) {
            res.status(400).json({ error: 'You have not upvoted this report' });
            return;
        }
        // Remove upvote
        report.upvoteCount = Math.max(0, report.upvoteCount - 1);
        report.upvotedBy.splice(upvotedIndex, 1);
        await report.save();
        // Invalidate feed cache
        await invalidateFeedCache();
        res.json({
            success: true,
            upvoteCount: report.upvoteCount,
            hasUpvoted: false,
        });
    }
    catch (err) {
        console.error('Remove upvote error:', err);
        res.status(500).json({ error: 'Failed to remove upvote' });
    }
};
export const checkUpvoteStatus = async (req, res) => {
    try {
        const { reportId } = req.params;
        const userId = req.user?.userId;
        const report = await Report.findById(reportId).select('upvotedBy upvoteCount');
        if (!report) {
            res.status(404).json({ error: 'Report not found' });
            return;
        }
        res.json({
            hasUpvoted: userId ? report.upvotedBy.includes(userId) : false,
            upvoteCount: report.upvoteCount,
        });
    }
    catch (err) {
        console.error('Check upvote error:', err);
        res.status(500).json({ error: 'Failed to check upvote status' });
    }
};
async function invalidateFeedCache() {
    // Delete feed cache patterns
    await redis.deletePattern('feed:*');
    await redis.deletePattern('feed:geojson:*');
}
