const Enrollment = require('../models/enrollmentModel');

const getAllEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.getAll();
    res.json(enrollments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

module.exports = {
  getAllEnrollments,
};
