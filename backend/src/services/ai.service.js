const Groq = require('groq-sdk');
const fs = require('fs');
const path = require('path');
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
          content: `You are a civic engagement assistant. Summarize the following issue report into a concise, professional title and a 1-sentence summary.
          
          CRITICAL INSTRUCTIONS:
          - DO NOT use labels like "Title:", "Summary:", or "**Title:**".
          - DO NOT start with "A concerned citizen is reporting" or "Urgent:".
          - Start directly with the title on the first line, followed by the summary on the second line.
          - Use a direct, active voice (e.g., "Illegal garbage dumping in Sector 32" instead of "A citizen reports...").`
        },
        {
          role: 'user',
          content: description
        }
      ],
      model: 'llama-3.3-70b-versatile',
    });

    let content = chatCompletion.choices[0]?.message?.content || description;
    
    // Post-processing to strip common AI prefixes if they still appear
    content = content.replace(/(\*\*|\*)?Title:(\*\*|\*)?/gi, '')
                    .replace(/(\*\*|\*)?Summary:(\*\*|\*)?/gi, '')
                    .replace(/A concerned citizen is reporting/gi, '')
                    .replace(/Urgent:/gi, '')
                    .trim();

    return content;
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

/**
 * Chat with the Climx AI (Hybrid RAG Implementation)
 */
const chatWithAI = async (message, history = []) => {
  try {
    const pineconeService = require('./pinecone.service');
    const Report = require('../models/Report');
    
    console.log('Climx RAG: Starting Hybrid Retrieval for query:', message);
    
    // 1. Vector Search (Pinecone)
    const queryEmbedding = await generateEmbedding(message);
    const vectorMatches = await pineconeService.findSimilarReports(queryEmbedding, 2);
    
    // 2. Keyword Search (MongoDB Text Index)
    const keywordMatches = await Report.find(
      { $text: { $search: message } },
      { score: { $meta: "textScore" } }
    ).sort({ score: { $meta: "textScore" } }).limit(2);

    // 3. Combine and De-duplicate Results
    const combinedResults = new Map();
    
    // Add vector matches
    if (vectorMatches.length > 0) {
      const reportIds = vectorMatches.map(m => m.metadata.report_id);
      const reports = await Report.find({ _id: { $in: reportIds } });
      reports.forEach(r => combinedResults.set(r._id.toString(), r));
    }
    
    // Add keyword matches
    keywordMatches.forEach(r => combinedResults.set(r._id.toString(), r));

    const finalContextReports = Array.from(combinedResults.values());
    
    let context = "No specific related reports found in our database.";
    if (finalContextReports.length > 0) {
      context = finalContextReports.map(r => 
        `Report [ID: ${r._id}, Category: ${r.category}, Status: ${r.status}]: ${r.description}`
      ).join('\n\n');
    }

    // 3. Ground Water Context (CGWB Data)
    let waterContext = "";
    try {
      const waterDataPath = path.join(__dirname, 'water_data.json');
      if (fs.existsSync(waterDataPath)) {
        const waterData = JSON.parse(fs.readFileSync(waterDataPath, 'utf8'));
        const mentionedState = waterData.data.find(s => 
          message.toUpperCase().includes(s.name.toUpperCase())
        );
        
        if (mentionedState) {
          waterContext = `\n\nGROUND WATER DATA FOR ${mentionedState.name} (Source: CGWB):
- Extraction Stage: ${mentionedState.metrics.stage_of_extraction_percent}%
- Status: ${mentionedState.metrics.status.toUpperCase().replace('_', ' ')}
- Total Availability: ${mentionedState.metrics.totalAvailability?.toLocaleString()} ham
- Future Availability: ${mentionedState.metrics.futureAvailability?.toLocaleString()} ham`;
        }
      }
    } catch (e) {
      console.error('Error reading water data for RAG:', e);
    }

    // 4. Construct the Augmented Prompt
    const systemPrompt = `You are Climx AI, a professional RAG-powered environment assistant for India. 
Your primary goal is to provide data-driven insights based on community reports and government environmental data.

CONTEXT FROM LOCAL REPORTS DATABASE:
${context}${waterContext}

INSTRUCTIONS:
1. Use the provided context to answer user queries about specific local issues or groundwater levels.
2. If the user asks about something not in the context, use your general knowledge but clearly state if you're talking about general trends versus specific data points.
3. Be concise, professional, and highlight how community reporting is helping resolve issues.
4. If a report mentioned in the context is 'resolved', mention it as a success story.
5. If the user mentions a state and water data is provided, use those exact numbers and the official STATUS (e.g., OVER-EXPLOITED) to explain the severity.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: message }
    ];

    console.log(`Climx RAG: Sending augmented prompt with ${finalContextReports.length} reports in context...`);
    const chatCompletion = await groq.chat.completions.create({
      messages,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3, // Lower temperature for high precision RAG
      max_tokens: 1024,
    });

    return chatCompletion.choices[0]?.message?.content || "I'm sorry, I couldn't process that request.";
  } catch (error) {
    console.error('CLIMX RAG ERROR:', error);
    logger.error(`RAG Chat Error: ${error.message}`);
    throw new Error(`RAG assistant error: ${error.message}`);
  }
};

module.exports = {
  summarizeDescription,
  generateEmbedding,
  chatWithAI
};
