const express = require('express');
const router = express.Router();
const axios = require('axios');
const logger = require('../config/logger');
const AQILog = require('../models/AQILog.model');

/**
 * @route GET /api/aqi/history
 * @desc Get historical AQI logs
 */
router.get('/history', async (req, res) => {
  try {
    const history = await AQILog.find()
      .sort({ timestamp: -1 })
      .limit(24);
    res.json(history.reverse()); // Chronological order for charts
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch AQI history' });
  }
});

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

    // Save to database for analytics
    try {
      const aqiInfo = response.data.indexes[0];
      await AQILog.create({
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        aqiValue: aqiInfo.aqi,
        category: aqiInfo.category,
        dominantPollutant: aqiInfo.dominantPollutant,
        regionCode: response.data.regionCode,
        timestamp: new Date() // Use exact current time for real-time logging
      });
      console.log('AQI Log saved to database');
    } catch (dbError) {
      console.error('Failed to save AQI log:', dbError.message);
    }

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
