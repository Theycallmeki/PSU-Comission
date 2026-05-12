const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Recommendation:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "ratio_kinder"
 *         type:
 *           type: string
 *           enum: [warning, danger, info, success]
 *           example: "warning"
 *         category:
 *           type: string
 *           enum: [Capacity, Trend, Retention, Demographics, System]
 *           example: "Capacity"
 *         title:
 *           type: string
 *           example: "High Student-to-Classroom Ratio in KINDER"
 *         message:
 *           type: string
 *           example: "The current ratio is 52.0 students per classroom."
 *         action:
 *           type: string
 *           example: "Infrastructure Update"
 *         data:
 *           type: object
 *           description: Supporting numerical data for the recommendation
 */

/**
 * @swagger
 * /api/recommendations:
 *   get:
 *     summary: Get data-driven recommendations
 *     description: Analyzes enrollment and classroom data to generate actionable recommendations covering capacity, trends, retention, and demographics.
 *     tags: [Recommendations]
 *     responses:
 *       200:
 *         description: Successfully generated recommendations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Recommendation'
 *       500:
 *         description: Internal server error
 */
router.get('/', recommendationController.getRecommendations);

module.exports = router;
