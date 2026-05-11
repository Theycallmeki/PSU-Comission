const db = require('../config/db');

const getAll = async () => {
  const result = await db.query('SELECT * FROM classrooms');
  return result.rows;
};

const getById = async (id) => {
  const result = await db.query('SELECT * FROM classrooms WHERE id = $1', [id]);
  return result.rows[0];
};

const create = async (classroomData) => {
  const { num_classrooms, grade_level } = classroomData;
  const result = await db.query(
    'INSERT INTO classrooms (num_classrooms, grade_level) VALUES ($1, $2) RETURNING *',
    [num_classrooms, grade_level]
  );
  return result.rows[0];
};

const update = async (id, classroomData) => {
  const { num_classrooms, grade_level } = classroomData;
  const result = await db.query(
    'UPDATE classrooms SET num_classrooms = $1, grade_level = $2 WHERE id = $3 RETURNING *',
    [num_classrooms, grade_level, id]
  );
  return result.rows[0];
};

const remove = async (id) => {
  const result = await db.query('DELETE FROM classrooms WHERE id = $1 RETURNING *', [id]);
  return result.rows[0];
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
};
