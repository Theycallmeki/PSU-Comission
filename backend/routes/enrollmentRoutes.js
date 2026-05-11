const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Enrollment:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated unique identifier
 *           example: 1
 *         school_year:
 *           type: string
 *           description: Academic school year range
 *           example: "2021 - 2022"
 *         kinder_f:
 *           type: integer
 *           description: Kindergarten female enrollees
 *           example: 25
 *         kinder_m:
 *           type: integer
 *           description: Kindergarten male enrollees
 *           example: 30
 *         kinder_total:
 *           type: integer
 *           description: Total kindergarten enrollees
 *           example: 55
 *         grade1_f:
 *           type: integer
 *           description: Grade 1 female enrollees
 *           example: 40
 *         grade1_m:
 *           type: integer
 *           description: Grade 1 male enrollees
 *           example: 38
 *         grade1_total:
 *           type: integer
 *           description: Total Grade 1 enrollees
 *           example: 78
 *         grade2_f:
 *           type: integer
 *           description: Grade 2 female enrollees
 *           example: 35
 *         grade2_m:
 *           type: integer
 *           description: Grade 2 male enrollees
 *           example: 33
 *         grade2_total:
 *           type: integer
 *           description: Total Grade 2 enrollees
 *           example: 68
 *         grade3_f:
 *           type: integer
 *           description: Grade 3 female enrollees
 *           example: 30
 *         grade3_m:
 *           type: integer
 *           description: Grade 3 male enrollees
 *           example: 28
 *         grade3_total:
 *           type: integer
 *           description: Total Grade 3 enrollees
 *           example: 58
 *         grade4_f:
 *           type: integer
 *           description: Grade 4 female enrollees
 *           example: 32
 *         grade4_m:
 *           type: integer
 *           description: Grade 4 male enrollees
 *           example: 34
 *         grade4_total:
 *           type: integer
 *           description: Total Grade 4 enrollees
 *           example: 66
 *         grade5_f:
 *           type: integer
 *           description: Grade 5 female enrollees
 *           example: 28
 *         grade5_m:
 *           type: integer
 *           description: Grade 5 male enrollees
 *           example: 30
 *         grade5_total:
 *           type: integer
 *           description: Total Grade 5 enrollees
 *           example: 58
 *         grade6_f:
 *           type: integer
 *           description: Grade 6 female enrollees
 *           example: 26
 *         grade6_m:
 *           type: integer
 *           description: Grade 6 male enrollees
 *           example: 24
 *         grade6_total:
 *           type: integer
 *           description: Total Grade 6 enrollees
 *           example: 50
 *         total_enrollees:
 *           type: integer
 *           description: Grand total of all enrollees across all grade levels
 *           example: 433
 *         dropped_repeater:
 *           type: integer
 *           description: Number of students who dropped out or are repeaters
 *           example: 5
 *       required:
 *         - school_year
 */

/**
 * @swagger
 * /api/enrollments:
 *   get:
 *     summary: Get all enrollments
 *     description: >
 *       Retrieves enrollment data for all school years. Each record contains
 *       a breakdown of enrollment counts by grade level (Kinder through Grade 6),
 *       split by gender (female/male), with totals per grade and an overall total.
 *       Also includes the number of dropped or repeater students.
 *     tags:
 *       - Enrollments
 *     responses:
 *       200:
 *         description: Successfully retrieved list of enrollment records
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Enrollment'
 *             example:
 *               - id: 1
 *                 school_year: "2021 - 2022"
 *                 kinder_f: 25
 *                 kinder_m: 30
 *                 kinder_total: 55
 *                 grade1_f: 40
 *                 grade1_m: 38
 *                 grade1_total: 78
 *                 grade2_f: 35
 *                 grade2_m: 33
 *                 grade2_total: 68
 *                 grade3_f: 30
 *                 grade3_m: 28
 *                 grade3_total: 58
 *                 grade4_f: 32
 *                 grade4_m: 34
 *                 grade4_total: 66
 *                 grade5_f: 28
 *                 grade5_m: 30
 *                 grade5_total: 58
 *                 grade6_f: 26
 *                 grade6_m: 24
 *                 grade6_total: 50
 *                 total_enrollees: 433
 *                 dropped_repeater: 5
 *       500:
 *         description: Internal server error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Server Error"
 */
router.get('/', enrollmentController.getAllEnrollments);

module.exports = router;
