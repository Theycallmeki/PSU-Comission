const express = require('express');
const router  = express.Router();
const { generateMetricsPDF } = require('../controllers/pdfController');

/**
 * @swagger
 * /api/pdf/metrics:
 *   get:
 *     summary: Generate and download a PDF report for the Metrics page
 *     tags: [PDF]
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: string
 *         description: School year to focus the report on (e.g. 2024-2025). Defaults to the latest year.
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

module.exports = router;
