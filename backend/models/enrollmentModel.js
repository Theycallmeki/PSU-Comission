const db = require('../config/db');

const getAll = async () => {
  const result = await db.query('SELECT * FROM enrollments');
  return result.rows;
};

module.exports = {
  getAll,
};
