const { Pinecone } = require('@pinecone-database/pinecone');
const logger = require('../config/logger');

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const index = pc.index('civic-reports'); // Ensure this index exists in Pinecone

const upsertEmbedding = async (id, vector, metadata) => {
  try {
    await index.upsert([{
      id,
      values: vector,
      metadata
    }]);
    logger.info(`Embedding upserted for report: ${id}`);
  } catch (error) {
    logger.error(`Pinecone Upsert Error: ${error.message}`);
    // Don't throw, just log. We don't want to break the whole flow if vector storage fails.
  }
};

const findSimilarReports = async (vector, limit = 5) => {
  try {
    const queryResponse = await index.query({
      vector,
      topK: limit,
      includeMetadata: true,
    });
    return queryResponse.matches;
  } catch (error) {
    logger.error(`Pinecone Query Error: ${error.message}`);
    return [];
  }
};

module.exports = {
  upsertEmbedding,
  findSimilarReports
};
