const express = require('express');
const router = express.Router();
const aiService = require('../services/ai.service');
const { protect } = require('../middleware/auth');
const logger = require('../config/logger');

/**
 * @route POST /api/ai/chat
 * @desc Chat with the EcoLens AI
 * @access Private
 */
router.post('/chat', protect, async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const response = await aiService.chatWithAI(message, history);
    
    res.json({ response });
  } catch (error) {
    console.error('AI CHAT ROUTE FULL ERROR:', error);
    logger.error(`AI Chat Route Error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
