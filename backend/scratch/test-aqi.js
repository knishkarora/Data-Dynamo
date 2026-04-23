require('dotenv').config();
const axios = require('axios');

async function testAQI() {
  try {
    const key = process.env.GOOGLE_MAPS_API_KEY;
    const url = `https://airquality.googleapis.com/v1/currentConditions:lookup?key=${key}`;
    console.log('Testing AQI with key:', key.substring(0, 5) + '...');
    
    const response = await axios.post(url, {
      location: {
        latitude: 30.9010,
        longitude: 75.8573
      }
    });
    console.log('SUCCESS:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('FAILED:', error.message);
    if (error.response) {
      console.error('ERROR DATA:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testAQI();
