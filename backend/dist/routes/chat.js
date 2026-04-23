import { Router } from 'express';
import { chat, getChatHistory, clearChatHistory } from '../controllers/chatController.js';
import { authenticate } from '../middleware/auth.js';
const router = Router();
router.post('/', chat);
router.get('/history', authenticate, getChatHistory);
router.delete('/history', authenticate, clearChatHistory);
export default router;
