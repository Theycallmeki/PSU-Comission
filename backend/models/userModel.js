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
  const result = await db.query(
    'SELECT id, username, role, is_approved, allowed_pages, created_at FROM users ORDER BY created_at DESC'
  );
  return result.rows;
};

const approveUser = async (id) => {
  const result = await db.query(
    'UPDATE users SET is_approved = true WHERE id = $1 RETURNING id, username, role, is_approved, allowed_pages',
    [id]
  );
  return result.rows[0];
};

const deleteUser = async (id) => {
  await db.query('DELETE FROM users WHERE id = $1', [id]);
};

// Update role and/or allowed_pages for a user
const updateUserPrivileges = async (id, { role, allowed_pages }) => {
  const result = await db.query(
    `UPDATE users
     SET role = COALESCE($1, role),
         allowed_pages = COALESCE($2, allowed_pages)
     WHERE id = $3
     RETURNING id, username, role, is_approved, allowed_pages`,
    [role ?? null, allowed_pages ? JSON.stringify(allowed_pages) : null, id]
  );
  return result.rows[0];
};

module.exports = {
  findByUsername,
  findById,
  updateRefreshToken,
  clearRefreshToken,
  getAllUsers,
  approveUser,
  deleteUser,
  updateUserPrivileges,
};