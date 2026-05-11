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
 *     tags: [Classrooms]
 *     responses:
 *       200:
 *         description: Successfully retrieved list of classrooms
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Classroom'
 *       500:
 *         description: Internal server error
 */
router.get('/', classroomController.getAllClassrooms);

/**
 * @swagger
 * /api/classrooms/{id}:
 *   get:
 *     summary: Get a classroom by ID
 *     tags: [Classrooms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Classroom ID
 *     responses:
 *       200:
 *         description: Classroom found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Classroom'
 *       404:
 *         description: Classroom not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', classroomController.getClassroomById);

/**
 * @swagger
 * /api/classrooms:
 *   post:
 *     summary: Create a new classroom
 *     tags: [Classrooms]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClassroomInput'
 *     responses:
 *       201:
 *         description: Classroom created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Classroom'
 *       500:
 *         description: Internal server error
 */
router.post('/', classroomController.createClassroom);

/**
 * @swagger
 * /api/classrooms/{id}:
 *   put:
 *     summary: Update a classroom by ID
 *     tags: [Classrooms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Classroom ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClassroomInput'
 *     responses:
 *       200:
 *         description: Classroom updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Classroom'
 *       404:
 *         description: Classroom not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', classroomController.updateClassroom);

/**
 * @swagger
 * /api/classrooms/{id}:
 *   delete:
 *     summary: Delete a classroom by ID
 *     tags: [Classrooms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Classroom ID
 *     responses:
 *       200:
 *         description: Classroom deleted successfully
 *       404:
 *         description: Classroom not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', classroomController.deleteClassroom);

module.exports = router;