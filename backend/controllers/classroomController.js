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

const getClassroomById = async (req, res) => {
  try {
    const classroom = await Classroom.getById(req.params.id);
    if (!classroom) {
      return res.status(404).json({ msg: 'Classroom not found' });
    }
    res.json(classroom);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

const createClassroom = async (req, res) => {
  try {
    const newClassroom = await Classroom.create(req.body);
    res.status(201).json(newClassroom);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

const updateClassroom = async (req, res) => {
  try {
    const updatedClassroom = await Classroom.update(req.params.id, req.body);
    if (!updatedClassroom) {
      return res.status(404).json({ msg: 'Classroom not found' });
    }
    res.json(updatedClassroom);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

const deleteClassroom = async (req, res) => {
  try {
    const deletedClassroom = await Classroom.remove(req.params.id);
    if (!deletedClassroom) {
      return res.status(404).json({ msg: 'Classroom not found' });
    }
    res.json({ msg: 'Classroom removed', classroom: deletedClassroom });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

module.exports = {
  getAllClassrooms,
  getClassroomById,
  createClassroom,
  updateClassroom,
  deleteClassroom,
};
