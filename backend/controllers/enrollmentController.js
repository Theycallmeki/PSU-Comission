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

const getEnrollmentById = async (req, res) => {
  try {
    const enrollment = await Enrollment.getById(req.params.id);
    if (!enrollment) {
      return res.status(404).json({ msg: 'Enrollment not found' });
    }
    res.json(enrollment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

const createEnrollment = async (req, res) => {
  try {
    const newEnrollment = await Enrollment.create(req.body);
    res.status(201).json(newEnrollment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

const updateEnrollment = async (req, res) => {
  try {
    const updatedEnrollment = await Enrollment.update(req.params.id, req.body);
    if (!updatedEnrollment) {
      return res.status(404).json({ msg: 'Enrollment not found' });
    }
    res.json(updatedEnrollment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

const deleteEnrollment = async (req, res) => {
  try {
    const deletedEnrollment = await Enrollment.remove(req.params.id);
    if (!deletedEnrollment) {
      return res.status(404).json({ msg: 'Enrollment not found' });
    }
    res.json({ msg: 'Enrollment removed', enrollment: deletedEnrollment });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

module.exports = {
  getAllEnrollments,
  getEnrollmentById,
  createEnrollment,
  updateEnrollment,
  deleteEnrollment,
};
