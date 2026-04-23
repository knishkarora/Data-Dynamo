import { config } from '../config/env.js';
class RedisService {
    _client = null;
    restUrl = '';
    restToken = '';
    get client() {
        return this._client;
    }
    async connect() {
        this.restUrl = config.redis.restUrl;
        this.restToken = config.redis.restToken;
        if (!this.restUrl || !this.restToken) {
            console.warn('⚠️ Upstash Redis not configured, caching disabled');
            this._client = null;
            return;
        }
        try {
            // Test connection
            const response = await fetch(`${this.restUrl}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.restToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(['PING']),
            });
            if (response.ok) {
                console.log('✅ Upstash Redis connected');
                this._client = this;
            }
            else {
                const text = await response.text();
                console.warn(`⚠️ Upstash Redis connection failed (${response.status}): ${text}`);
                this._client = null;
            }
        }
        catch (err) {
            console.warn('⚠️ Upstash Redis connection failed, caching disabled:', err.message);
            this._client = null;
        }
    }
    async exec(command) {
        const response = await fetch(`${this.restUrl}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.restToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(command),
        });
        if (!response.ok)
            throw new Error(`Redis error: ${response.statusText}`);
        const data = await response.json();
        return data.result;
    }
    async get(key) {
        if (!this._client)
            return null;
        try {
            const result = await this.exec(['GET', key]);
            return result ?? null;
        }
        catch (err) {
            console.error('Redis get error:', err);
            return null;
        }
    }
    async set(key, value, expireSeconds = 300) {
        if (!this._client)
            return false;
        try {
            await this.exec(['SET', key, value, 'EX', String(expireSeconds)]);
            return true;
        }
        catch (err) {
            console.error('Redis set error:', err);
            return false;
        }
    }
    async setex(key, seconds, value) {
        if (!this._client)
            return false;
        try {
            await this.exec(['SETEX', key, String(seconds), value]);
            return true;
        }
        catch (err) {
            console.error('Redis setex error:', err);
            return false;
        }
    }
    async del(key) {
        if (!this._client)
            return false;
        try {
            await this.exec(['DEL', key]);
            return true;
        }
        catch (err) {
            console.error('Redis del error:', err);
            return false;
        }
    }
    async exists(key) {
        if (!this._client)
            return 0;
        try {
            const result = await this.exec(['EXISTS', key]);
            return result ?? 0;
        }
        catch (err) {
            console.error('Redis exists error:', err);
            return 0;
        }
    }
    async incr(key) {
        if (!this._client)
            return 0;
        try {
            const result = await this.exec(['INCR', key]);
            return result ?? 0;
        }
        catch (err) {
            console.error('Redis incr error:', err);
            return 0;
        }
    }
    async expire(key, seconds) {
        if (!this._client)
            return false;
        try {
            await this.exec(['EXPIRE', key, String(seconds)]);
            return true;
        }
        catch (err) {
            console.error('Redis expire error:', err);
            return false;
        }
    }
    async deletePattern(pattern) {
        if (!this._client)
            return;
        try {
            const keys = await this.exec(['KEYS', pattern]);
            if (keys.length > 0) {
                for (const key of keys) {
                    await this.del(key);
                }
            }
        }
        catch (err) {
            console.error('Redis deletePattern error:', err);
        }
    }
}
export const redis = new RedisService();
