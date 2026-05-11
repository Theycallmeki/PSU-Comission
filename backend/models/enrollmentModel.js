const db = require('../config/db');

const getAll = async () => {
  const result = await db.query('SELECT * FROM enrollments');
  return result.rows;
};

const getById = async (id) => {
  const result = await db.query('SELECT * FROM enrollments WHERE id = $1', [id]);
  return result.rows[0];
};

const create = async (enrollmentData) => {
  const fields = Object.keys(enrollmentData).filter(key => key !== 'id');
  const values = fields.map(key => enrollmentData[key]);
  const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
  
  const query = `INSERT INTO enrollments (${fields.join(', ')}) VALUES (${placeholders}) RETURNING *`;
  const result = await db.query(query, values);
  return result.rows[0];
};

const update = async (id, enrollmentData) => {
  const fields = Object.keys(enrollmentData).filter(key => key !== 'id');
  const values = fields.map(key => enrollmentData[key]);
  
  const setString = fields.map((field, i) => `${field} = $${i + 1}`).join(', ');
  const query = `UPDATE enrollments SET ${setString} WHERE id = $${fields.length + 1} RETURNING *`;
  
  const result = await db.query(query, [...values, id]);
  return result.rows[0];
};

const remove = async (id) => {
  const result = await db.query('DELETE FROM enrollments WHERE id = $1 RETURNING *', [id]);
  return result.rows[0];
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
};
