const Classroom = require("../models/classroomModel");
const Enrollment = require("../models/enrollmentModel");

/**
 * Get quick analytics stats based on the latest enrollment year.
 * Requirements implemented:
 * - seat count = total enrollees for the year
 * - number of teacher is equivalent to the number of classrooms
 * - teacher to student ratio
 * - seats utilization and ratio
 */
const getQuickStats = async (req, res) => {
  try {
    const [classrooms, enrollments] = await Promise.all([
      Classroom.getAll(),
      Enrollment.getAll()
    ]);

    if (!enrollments || enrollments.length === 0) {
      return res.json({
        schoolYear: "N/A",
        seatCount: 0,
        teacherCount: 0,
        studentTeacherRatio: 0,
        utilization: 0,
        utilizationRatio: "0:0",
        totalEnrollees: 0
      });
    }

    // Sort enrollments to get the latest school year
    const sortedEnrollments = [...enrollments].sort((a, b) => b.school_year.localeCompare(a.school_year));
    const latestEnrollment = sortedEnrollments[0];
    const totalEnrollees = latestEnrollment.total_enrollees || 0;

    // Requirement: number of teacher is equivalent to the number of classrooms
    const totalClassrooms = classrooms.reduce((acc, c) => acc + (c.num_classrooms || 0), 0);
    const teacherCount = totalClassrooms;

    // Requirement: teacher to student ratio
    const studentTeacherRatio = teacherCount > 0 
      ? parseFloat((totalEnrollees / teacherCount).toFixed(2)) 
      : 0;

    // Requirement: seat count = total enrollees for the year
    const seatCount = totalEnrollees;

    // Requirement: seats utilization and ratio
    // Since seatCount = totalEnrollees by definition, utilization is 100% and ratio is 1:1
    // We provide these values as requested.
    const utilization = totalEnrollees > 0 ? 100 : 0;
    const utilizationRatio = totalEnrollees > 0 ? "1:1" : "0:0";

    res.json({
      success: true,
      data: {
        schoolYear: latestEnrollment.school_year,
        totalEnrollees,
        teacherCount,
        studentTeacherRatio,
        seatCount,
        utilization,
        utilizationRatio
      }
    });
  } catch (err) {
    console.error("Analytics Error:", err);
    res.status(500).json({ 
      success: false, 
      msg: "Failed to calculate analytics", 
      error: err.message 
    });
  }
};

module.exports = {
  getQuickStats
};
