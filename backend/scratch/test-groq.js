require('dotenv').config();
const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function testGroq() {
  try {
    console.log('Testing Groq with model llama3-8b-8192...');
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: 'Hello' }],
      model: 'llama3-8b-8192',
    });
    console.log('SUCCESS:', chatCompletion.choices[0].message.content);
  } catch (error) {
    console.error('FAILED:', error.message);
    if (error.response) {
      console.error('DATA:', error.response.data);
    }
  }
}

testGroq();
