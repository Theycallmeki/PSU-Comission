const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

/**
 * @swagger
 * /api/analytics/quick-stats:
 *   get:
 *     summary: Get summary analytics (ratios, seat counts, etc.)
 *     tags: [Analytics]
 *     responses:
 *       200:
 *         description: Successfully retrieved analytics
 *       500:
 *         description: Internal server error
 */
router.get('/quick-stats', analyticsController.getQuickStats);

module.exports = router;
