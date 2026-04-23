import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
export const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Missing authentication token' });
        return;
    }
    const token = authHeader.slice(7);
    if (!config.clerk.secretKey) {
        // Dev mode: accept any token and use a mock user
        try {
            const payload = jwt.decode(token) || {};
            req.user = {
                userId: (payload.sub || payload.user_id || 'anonymous'),
                payload,
            };
            next();
        }
        catch {
            res.status(401).json({ error: 'Invalid token' });
        }
        return;
    }
    try {
        const payload = jwt.verify(token, config.clerk.secretKey);
        req.user = {
            userId: (payload.sub || payload.user_id),
            payload,
        };
        next();
    }
    catch (err) {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
};
export const optionalAuth = (req, _res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        next();
        return;
    }
    const token = authHeader.slice(7);
    try {
        const payload = jwt.decode(token) || {};
        req.user = {
            userId: (payload.sub || payload.user_id || 'anonymous'),
            payload,
        };
    }
    catch {
        // Ignore invalid tokens for optional auth
    }
    next();
};
