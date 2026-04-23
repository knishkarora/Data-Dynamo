const { Redis } = require('@upstash/redis');
const logger = require('./logger');

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

logger.info('Upstash Redis Client Initialized');

module.exports = redis;
