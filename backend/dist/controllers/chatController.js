import { GroqService } from '../services/groqService.js';
import { ContextService } from '../services/contextService.js';
import { CacheService } from '../services/cacheService.js';
import { RateLimiter } from '../services/rateLimiter.js';
import { ChatHistory } from '../models/chatHistory.js';
export const chat = async (req, res) => {
    try {
        const { message, reportId, getContext } = req.body;
        if (!message?.trim()) {
            res.status(400).json({ error: 'Message is required' });
            return;
        }
        if (message.length > 1000) {
            res.status(400).json({ error: 'Message too long (max 1000 characters)' });
            return;
        }
        const userId = req.user?.userId || 'anonymous';
        // Rate limiting
        const allowed = await RateLimiter.isAllowed(userId);
        if (!allowed) {
            res.status(429).json({
                error: 'Rate limit exceeded. Please wait before sending another message.',
                retryAfter: await RateLimiter.getRemaining(userId),
            });
            return;
        }
        await RateLimiter.increment(userId);
        // Check cache
        const cached = await CacheService.get(message, reportId);
        if (cached) {
            res.json({
                answer: cached,
                cached: true,
                remaining: await RateLimiter.getRemaining(userId),
            });
            return;
        }
        // Build context
        let reportData;
        let relatedReports;
        if (reportId) {
            const ctx = await ContextService.getReportContext(reportId);
            reportData = ctx ?? undefined;
        }
        if (reportId && getContext) {
            relatedReports = await ContextService.getRelatedReports(reportId);
        }
        // Call Groq
        const { answer, confidence } = await GroqService.getCompletion(message, {
            reportData,
            relatedReports,
        });
        // Cache response
        await CacheService.set(message, reportId, answer);
        // Log to history
        await ChatHistory.create({
            userId,
            message,
            response: answer,
            reportId,
            confidence,
        });
        res.json({
            answer,
            confidence,
            cached: false,
            remaining: await RateLimiter.getRemaining(userId),
        });
    }
    catch (err) {
        console.error('Chat error:', err);
        res.status(500).json({ error: 'Failed to process chat request' });
    }
};
export const getChatHistory = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);
        const history = await ChatHistory.find({ userId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .select('message response reportId confidence createdAt')
            .lean();
        res.json({ history });
    }
    catch (err) {
        console.error('Chat history error:', err);
        res.status(500).json({ error: 'Failed to fetch chat history' });
    }
};
export const clearChatHistory = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }
        await ChatHistory.deleteMany({ userId });
        res.json({ message: 'Chat history cleared' });
    }
    catch (err) {
        console.error('Clear chat history error:', err);
        res.status(500).json({ error: 'Failed to clear chat history' });
    }
};
