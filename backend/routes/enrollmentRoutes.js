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
 *           example: 1
 *         school_year:
 *           type: string
 *           example: "2021 - 2022"
 *         kinder_f:
 *           type: integer
 *           example: 25
 *         kinder_m:
 *           type: integer
 *           example: 30
 *         kinder_total:
 *           type: integer
 *           example: 55
 *         grade1_f:
 *           type: integer
 *           example: 40
 *         grade1_m:
 *           type: integer
 *           example: 38
 *         grade1_total:
 *           type: integer
 *           example: 78
 *         grade2_f:
 *           type: integer
 *           example: 35
 *         grade2_m:
 *           type: integer
 *           example: 33
 *         grade2_total:
 *           type: integer
 *           example: 68
 *         grade3_f:
 *           type: integer
 *           example: 30
 *         grade3_m:
 *           type: integer
 *           example: 28
 *         grade3_total:
 *           type: integer
 *           example: 58
 *         grade4_f:
 *           type: integer
 *           example: 32
 *         grade4_m:
 *           type: integer
 *           example: 34
 *         grade4_total:
 *           type: integer
 *           example: 66
 *         grade5_f:
 *           type: integer
 *           example: 28
 *         grade5_m:
 *           type: integer
 *           example: 30
 *         grade5_total:
 *           type: integer
 *           example: 58
 *         grade6_f:
 *           type: integer
 *           example: 26
 *         grade6_m:
 *           type: integer
 *           example: 24
 *         grade6_total:
 *           type: integer
 *           example: 50
 *         total_enrollees:
 *           type: integer
 *           example: 433
 *         dropped_repeater:
 *           type: integer
 *           example: 5
 */

/**
 * @swagger
 * /api/enrollments:
 *   get:
 *     summary: Get all enrollments
 *     description: Retrieves enrollment data for all school years, broken down by grade level and gender.
 *     tags:
 *       - Enrollments
 *     responses:
 *       200:
 *         description: A list of enrollment records
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Enrollment'
 *       500:
 *         description: Server Error
 */
router.get('/', enrollmentController.getAllEnrollments);

module.exports = router;
