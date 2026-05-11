const db = require('../config/db');

const getAll = async () => {
  const result = await db.query('SELECT * FROM classrooms');
  return result.rows;
};

module.exports = {
  getAll,
};
