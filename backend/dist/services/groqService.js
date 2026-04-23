import axios from 'axios';
import { config } from '../config/env.js';
const SYSTEM_PROMPT = `You are an AI civic assistant for Climx, an environmental accountability dashboard for Punjab, India. Your role is to help citizens understand civic issues, policies, and reports in simple terms.

Guidelines:
- Explain things in plain language understandable by common citizens
- Be concise and to the point (aim for 2-3 paragraphs max)
- Avoid technical jargon or explain it when unavoidable
- Do not hallucinate or make up information
- If you don't know something, say so honestly
- Focus on providing actionable context when possible
- Be helpful regarding environmental issues, civic reports, government policies, and community matters`;
export class GroqService {
    static async callAPI(messages) {
        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: config.groq.model,
            messages,
            temperature: 0.7,
            max_tokens: config.groq.maxTokens,
        }, {
            headers: {
                Authorization: `Bearer ${config.groq.apiKey}`,
                'Content-Type': 'application/json',
            },
        });
        if (!response.data.choices?.[0]?.message?.content) {
            throw new Error('Invalid response from Groq API');
        }
        return response.data.choices[0].message.content;
    }
    static async getCompletion(userMessage, context) {
        const messages = [{ role: 'system', content: SYSTEM_PROMPT }];
        if (context?.reportData) {
            messages.push({
                role: 'system',
                content: `Context from related report:\n${context.reportData}`,
            });
        }
        if (context?.relatedReports?.length) {
            messages.push({
                role: 'system',
                content: `Related reports:\n${context.relatedReports.join('\n')}`,
            });
        }
        messages.push({ role: 'user', content: userMessage });
        const answer = await this.callAPI(messages);
        // Simple confidence based on response length and content quality
        const confidence = answer.length > 50 ? 0.85 : 0.6;
        return { answer, confidence };
    }
}
