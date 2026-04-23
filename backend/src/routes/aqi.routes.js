const express = require('express');
const router = express.Router();
const axios = require('axios');
const logger = require('../config/logger');

/**
 * @route POST /api/aqi
 * @desc Get real-time AQI for a location using Google Air Quality API
 * @access Public
 */
router.post('/', async (req, res) => {
  try {
    let { latitude, longitude } = req.body;

    // Log incoming data for debugging
    console.log('AQI Request received for:', { latitude, longitude });

    // Validate and fallback to Ludhiana if invalid
    if (!latitude || isNaN(parseFloat(latitude)) || !longitude || isNaN(parseFloat(longitude))) {
      console.warn('Invalid coordinates received, falling back to default (Ludhiana)');
      latitude = 30.9010;
      longitude = 75.8573;
    }

    const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
    const url = `https://airquality.googleapis.com/v1/currentConditions:lookup?key=${GOOGLE_API_KEY}`;

    const response = await axios.post(url, {
      location: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      }
    });

    res.json(response.data);
  } catch (error) {
    if (error.response) {
      console.error('GOOGLE AQI API ERROR RESPONSE:', JSON.stringify(error.response.data, null, 2));
      return res.status(error.response.status).json(error.response.data);
    }
    logger.error(`AQI API Error: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch AQI data' });
  }
});

module.exports = router;
