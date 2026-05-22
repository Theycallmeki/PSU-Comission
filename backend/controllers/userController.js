const userModel = require('../models/userModel');

const getUsers = async (req, res) => {
  try {
    const users = await userModel.getAllUsers();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

const approveUser = async (req, res) => {
  const { id } = req.params;
  try {
    const approvedUser = await userModel.approveUser(id);
    if (!approvedUser) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json(approvedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await userModel.deleteUser(id);
    res.json({ message: 'User deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// PATCH /:id/privileges
// Body: { role: 'admin'|'user', allowed_pages: [...] }
const updatePrivileges = async (req, res) => {
  const { id } = req.params;
  const { role, allowed_pages } = req.body;

  // Prevent admin from demoting themselves
  if (String(req.user.id) === String(id) && role && role !== 'admin') {
    return res.status(400).json({ message: 'Admins cannot demote themselves.' });
  }

  try {
    const updated = await userModel.updateUserPrivileges(id, { role, allowed_pages });
    if (!updated) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

module.exports = {
  getUsers,
  approveUser,
  deleteUser,
  updatePrivileges,
};