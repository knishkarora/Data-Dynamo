const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const logger = require('../config/logger');

/**
 * Get groundwater data for all states
 */
router.get('/stats', (req, res) => {
  try {
    const dataPath = path.join(__dirname, '../services/water_data.json');
    if (!fs.existsSync(dataPath)) {
      return res.status(404).json({ error: 'Water data not found' });
    }
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    res.json(data);
  } catch (error) {
    logger.error(`Get Water Stats Error: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
