const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { verifyJWT } = require('../middleware/authMiddleware');

/**
 * @swagger
 * /api/ai/chat:
 *   post:
 *     summary: Chat with AI about school data
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: AI response
 *       500:
 *         description: Server error
 */
router.post('/chat', verifyJWT, aiController.chatWithData);

module.exports = router;
