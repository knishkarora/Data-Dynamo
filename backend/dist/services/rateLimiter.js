import { redis } from './redis.js';
import { config } from '../config/env.js';
export class RateLimiter {
    static getKey(userId) {
        return `chat:ratelimit:${userId}`;
    }
    static async isAllowed(userId) {
        const client = redis.client;
        if (!client)
            return true;
        const key = this.getKey(userId);
        const current = await client.get(key);
        const count = parseInt(current || '0', 10);
        if (count >= config.chat.rateLimitMax) {
            return false;
        }
        return true;
    }
    static async increment(userId) {
        const client = redis.client;
        if (!client)
            return;
        const key = this.getKey(userId);
        const exists = await client.exists(key);
        if (exists) {
            await client.incr(key);
        }
        else {
            await client.setex(key, config.chat.rateLimitWindow, '1');
        }
    }
    static async getRemaining(userId) {
        const client = redis.client;
        if (!client)
            return config.chat.rateLimitMax;
        const key = this.getKey(userId);
        const current = await client.get(key);
        const count = parseInt(current || '0', 10);
        return Math.max(0, config.chat.rateLimitMax - count);
    }
}
