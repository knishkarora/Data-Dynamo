require('dotenv').config();
const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function testGroq() {
  const models = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'];
  
  for (const model of models) {
    try {
      console.log(`Testing Groq with model ${model}...`);
      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: 'Hello' }],
        model: model,
      });
      console.log(`SUCCESS with ${model}:`, chatCompletion.choices[0].message.content);
      return; // Stop after first success
    } catch (error) {
      console.error(`FAILED with ${model}:`, error.message);
    }
  }
}

testGroq();
