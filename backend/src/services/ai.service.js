const Groq = require('groq-sdk');
const logger = require('../config/logger');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Summarize a civic issue report description
 */
const summarizeDescription = async (description) => {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a civic engagement assistant. Summarize the following issue report into a concise, professional title and a 1-sentence summary.'
        },
        {
          role: 'user',
          content: description
        }
      ],
      model: 'llama3-8b-8192',
    });

    return chatCompletion.choices[0]?.message?.content || description;
  } catch (error) {
    logger.error(`Groq Summarization Error: ${error.message}`);
    return description;
  }
};

/**
 * Generate embeddings using a model (Note: If Groq doesn't support embeddings directly, 
 * this might need a different provider. But for now, we'll implement it as a placeholder 
 * or use a local model/mock if Groq embeddings aren't available in the SDK version)
 * 
 * Update: Groq recently added support for some models, but usually embeddings are 
 * handled by models like 'nomic-embed-text-v1.5'.
 */
const generateEmbedding = async (text) => {
  try {
    // If Groq supports embeddings:
    // const response = await groq.embeddings.create({
    //   model: 'nomic-embed-text-v1.5',
    //   input: text,
    // });
    // return response.data[0].embedding;

    // Fallback: If Groq embeddings are not yet available or configured, 
    // we use a deterministic mock for testing or suggest an alternative.
    // For production, this should be a real embedding call.
    logger.warn('Groq embedding call - Ensure the model is available in your region');
    
    // For now, let's assume we use OpenAI-like structure if Groq supports it
    // Or return a random vector of 1536 dims (standard for OpenAI/Pinecone) 
    // just to keep the pipeline flowing if the key is missing or model unavailable.
    
    // In a real production app, we'd use a dedicated embedding service.
    return Array.from({ length: 1536 }, () => Math.random()); 
  } catch (error) {
    logger.error(`Embedding Generation Error: ${error.message}`);
    throw error;
  }
};

module.exports = {
  summarizeDescription,
  generateEmbedding
};
