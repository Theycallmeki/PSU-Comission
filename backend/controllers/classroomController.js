const Classroom = require('../models/classroomModel');

const getAllClassrooms = async (req, res) => {
  try {
    const classrooms = await Classroom.getAll();
    res.json(classrooms);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

module.exports = {
  getAllClassrooms,
};
