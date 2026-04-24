const cron = require('node-cron');
const redis = require('../config/redis');
const Report = require('../models/Report');
const logger = require('../config/logger');

/**
 * Sync Redis data to MongoDB every 2 minutes
 */
const startSyncJob = () => {
  // Run every 2 minutes: '*/2 * * * *'
  cron.schedule('*/2 * * * *', async () => {
    logger.info('Starting Redis to MongoDB sync job...');
    
    try {
      // 1. Get all report IDs that need syncing
      const reportIds = await redis.smembers('pending_sync:reports');
      
      if (!reportIds || reportIds.length === 0) {
        logger.info('No pending reports to sync.');
        return;
      }

      logger.info(`Syncing ${reportIds.length} reports...`);

      for (const reportId of reportIds) {
        try {
          const upKey = `votes:${reportId}:up`;
          const downKey = `votes:${reportId}:down`;
          const commentKey = `comments:${reportId}`;

          const upSyncKey = `${upKey}:syncing`;
          const downSyncKey = `${downKey}:syncing`;
          const commentSyncKey = `${commentKey}:syncing`;

          // Atomic rename to isolate the data we are syncing
          // Note: Rename will fail if the key doesn't exist, so we check first or use a script.
          // For simplicity with Upstash REST, we'll just fetch and then conditional delete if we want to be perfect, 
          // but renaming is a good middle ground.
          
          const hasUp = await redis.exists(upKey);
          const hasDown = await redis.exists(downKey);
          const hasComments = await redis.exists(commentKey);

          if (hasUp) await redis.rename(upKey, upSyncKey);
          if (hasDown) await redis.rename(downKey, downSyncKey);
          if (hasComments) await redis.rename(commentKey, commentSyncKey);

          // Fetch data from the syncing keys
          const [upvotes, downvotes, rawComments] = await Promise.all([
            hasUp ? redis.smembers(upSyncKey) : Promise.resolve([]),
            hasDown ? redis.smembers(downSyncKey) : Promise.resolve([]),
            hasComments ? redis.lrange(commentSyncKey, 0, -1) : Promise.resolve([])
          ]);

          const comments = rawComments.map(c => JSON.parse(c));

          // Bulk Update MongoDB
          const update = {};
          if (upvotes.length > 0 || hasUp) update.$set = { ...update.$set, upvotes };
          if (downvotes.length > 0 || hasDown) update.$set = { ...update.$set, downvotes };
          
          if (comments.length > 0) {
            update.$push = {
              comments: { $each: comments }
            };
          }

          if (Object.keys(update).length > 0) {
            await Report.findByIdAndUpdate(reportId, update, { runValidators: false });
          }

          // Clean up syncing keys and remove from pending set
          await Promise.all([
            redis.del(upSyncKey),
            redis.del(downSyncKey),
            redis.del(commentSyncKey),
            redis.srem('pending_sync:reports', reportId)
          ]);

          logger.info(`Successfully synced report: ${reportId}`);
        } catch (reportErr) {
          logger.error(`Error syncing report ${reportId}: ${reportErr.message}`);
        }
      }

      logger.info('Sync job completed.');
    } catch (err) {
      logger.error(`Sync Job Error: ${err.message}`);
    }
  });

  logger.info('Data sync cron job scheduled (every 2 minutes)');
};

module.exports = startSyncJob;
