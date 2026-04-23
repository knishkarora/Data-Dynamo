const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// --- Specific Routes First ---

// Public specific routes
router.get('/map', reportController.getMapReports);
router.get('/counts', reportController.getReportCounts);

// Protected specific routes
router.get('/stats', protect, reportController.getUserStats);
router.get('/my-reports', protect, reportController.getMyReports);

// --- Parameterized/General Routes Last ---

// Public general routes
router.get('/', reportController.getReports);
router.get('/:id', reportController.getReportById);

// Protected general routes
router.post('/', protect, upload.single('image'), reportController.createReport);
router.post('/:id/vote', protect, reportController.voteReport);
router.post('/:id/comment', protect, reportController.addComment);

module.exports = router;
