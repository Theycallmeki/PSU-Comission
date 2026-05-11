const express = require('express');
const router = express.Router();
const classroomController = require('../controllers/classroomController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Classroom:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated ID
 *           example: 1
 *         grade_level:
 *           type: string
 *           description: Grade level name
 *           example: "GRADE 1"
 *         num_classrooms:
 *           type: integer
 *           description: Number of classrooms for the grade level
 *           example: 2
 */

/**
 * @swagger
 * /api/classrooms:
 *   get:
 *     summary: Get all classrooms
 *     description: Retrieves the list of all classrooms with their grade levels and counts.
 *     tags:
 *       - Classrooms
 *     responses:
 *       200:
 *         description: A list of classrooms
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Classroom'
 *       500:
 *         description: Server Error
 */
router.get('/', classroomController.getAllClassrooms);

module.exports = router;
