const Classroom = require("../models/classroomModel");
const Enrollment = require("../models/enrollmentModel");

/**
 * Get analytics stats for all available school years.
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
        success: true,
        data: []
      });
    }

    // Sort enrollments to get school years in chronological or reverse chronological order
    // Usually analytics show trends, so let's keep them sorted.
    const sortedEnrollments = [...enrollments].sort((a, b) => b.school_year.localeCompare(a.school_year));

    // Requirement: number of teacher is equivalent to the number of classrooms
    // Note: If teacher count depends on the specific year, we might need a more complex model.
    // For now, we use the current total classrooms as the teacher count for all years
    // as per the requirement logic provided in the original code.
    const totalClassrooms = classrooms.reduce((acc, c) => acc + (c.num_classrooms || 0), 0);
    const teacherCount = totalClassrooms;

    const statsHistory = sortedEnrollments.map(enrollment => {
      const totalEnrollees = enrollment.total_enrollees || 0;
      
      // Requirement: teacher to student ratio
      const studentTeacherRatio = teacherCount > 0 
        ? parseFloat((totalEnrollees / teacherCount).toFixed(2)) 
        : 0;

      // Requirement: seat count = total enrollees for the year
      const seatCount = totalEnrollees;

      // Requirement: seats utilization and ratio
      const utilization = totalEnrollees > 0 ? 100 : 0;
      const utilizationRatio = totalEnrollees > 0 ? "1:1" : "0:0";

      return {
        schoolYear: enrollment.school_year,
        totalEnrollees,
        teacherCount,
        studentTeacherRatio,
        seatCount,
        utilization,
        utilizationRatio
      };
    });

    res.json({
      success: true,
      data: statsHistory
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
