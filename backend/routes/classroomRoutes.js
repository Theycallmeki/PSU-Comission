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
 *           description: Auto-generated unique identifier
 *           example: 1
 *         grade_level:
 *           type: string
 *           description: Grade level name (e.g. KINDER, GRADE 1 through GRADE 6)
 *           example: "GRADE 1"
 *         num_classrooms:
 *           type: integer
 *           description: Number of classrooms allocated for this grade level
 *           example: 2
 *       required:
 *         - grade_level
 *         - num_classrooms
 *     ClassroomInput:
 *       type: object
 *       required:
 *         - grade_level
 *         - num_classrooms
 *       properties:
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
 *     description: Retrieves the complete list of all classroom allocations with their grade levels and counts.
 *     tags:
 *       - Classrooms
 *     responses:
 *       200:
 *         description: Successfully retrieved list of classrooms
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Classroom'
 *             example:
 *               - id: 1
 *                 grade_level: "KINDER"
 *                 num_classrooms: 1
 *               - id: 2
 *                 grade_level: "GRADE 1"
 *                 num_classrooms: 2
 *               - id: 3
 *                 grade_level: "GRADE 2"
 *                 num_classrooms: 2
 *       500:
 *         description: Internal server error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Server Error"
 */
router.get('/', classroomController.getAllClassrooms);

module.exports = router;
