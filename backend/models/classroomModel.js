const db = require('../config/db');

const getAll = async () => {
  const result = await db.query(`
    SELECT * FROM classrooms 
    ORDER BY CASE grade_level
      WHEN 'KINDER' THEN 1
      WHEN 'GRADE 1' THEN 2
      WHEN 'GRADE 2' THEN 3
      WHEN 'GRADE 3' THEN 4
      WHEN 'GRADE 4' THEN 5
      WHEN 'GRADE 5' THEN 6
      WHEN 'GRADE 6' THEN 7
      ELSE 8
    END
  `);
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
