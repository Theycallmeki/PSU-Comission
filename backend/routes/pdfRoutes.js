const express = require('express');
const router  = express.Router();
const { generateMetricsPDF, generateMetricsChartsPDF } = require('../controllers/pdfController');

/**
 * @swagger
 * /api/pdf/metrics:
 *   get:
 *     summary: Generate and download a PDF report for the Metrics page (tables only)
 *     tags: [PDF]
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: string
 *         description: School year to focus on (e.g. 2024-2025). Defaults to latest year.
 *     responses:
 *       200:
 *         description: PDF file stream
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       500:
 *         description: PDF generation failed
 */
router.get('/metrics', generateMetricsPDF);

/**
 * @swagger
 * /api/pdf/metrics-charts:
 *   post:
 *     summary: Generate a PDF report that includes chart images + data tables
 *     tags: [PDF]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               year:
 *                 type: string
 *                 example: "2024-2025"
 *               charts:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     label:
 *                       type: string
 *                     dataUrl:
 *                       type: string
 *                       description: Base64 PNG data URL from html2canvas
 *     responses:
 *       200:
 *         description: PDF file stream
 *       500:
 *         description: PDF generation failed
 */
router.post('/metrics-charts', generateMetricsChartsPDF);

module.exports = router;
