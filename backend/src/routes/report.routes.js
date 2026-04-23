const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public Routes
router.get('/', reportController.getReports);
router.get('/map', reportController.getMapReports);

// Protected Routes
router.post('/', protect, upload.single('image'), reportController.createReport);
router.get('/stats', protect, reportController.getUserStats);
router.get('/my-reports', protect, reportController.getMyReports);

module.exports = router;
