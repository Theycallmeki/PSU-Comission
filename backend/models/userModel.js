const db = require('../config/db');

const findByUsername = async (username) => {
  const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
  return result.rows[0];
};

const findById = async (id) => {
  const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0];
};

const updateRefreshToken = async (id, token) => {
  await db.query('UPDATE users SET refresh_token = $1 WHERE id = $2', [token, id]);
};

const clearRefreshToken = async (id) => {
  await db.query('UPDATE users SET refresh_token = NULL WHERE id = $1', [id]);
};

const getAllUsers = async () => {
  const result = await db.query('SELECT id, username, role, is_approved, created_at FROM users ORDER BY created_at DESC');
  return result.rows;
};

const approveUser = async (id) => {
  const result = await db.query('UPDATE users SET is_approved = true WHERE id = $1 RETURNING id, username, role, is_approved', [id]);
  return result.rows[0];
};

const deleteUser = async (id) => {
  await db.query('DELETE FROM users WHERE id = $1', [id]);
};

module.exports = {
  findByUsername,
  findById,
  updateRefreshToken,
  clearRefreshToken,
  getAllUsers,
  approveUser,
  deleteUser,
};
