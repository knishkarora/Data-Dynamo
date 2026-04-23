import crypto from 'crypto';
import { redis } from './redis.js';
import { config } from '../config/env.js';
export class CacheService {
    static getKey(message, reportId) {
        const hash = crypto
            .createHash('sha256')
            .update(`${message}:${reportId || 'none'}`)
            .digest('hex')
            .slice(0, 16);
        return `chat:response:${hash}`;
    }
    static async get(message, reportId) {
        const client = redis.client;
        if (!client)
            return null;
        const key = this.getKey(message, reportId);
        return client.get(key);
    }
    static async set(message, reportId, response) {
        const client = redis.client;
        if (!client)
            return;
        const key = this.getKey(message, reportId);
        await client.setex(key, config.chat.cacheTTL, response);
    }
    static async invalidate(message, reportId) {
        const client = redis.client;
        if (!client)
            return;
        const key = this.getKey(message, reportId);
        await client.del(key);
    }
}
