const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// verifyJWT + isAdmin already applied in server.js
router.get('/',                     userController.getUsers);
router.put('/:id/approve',          userController.approveUser);
router.patch('/:id/privileges',     userController.updatePrivileges);
router.delete('/:id',               userController.deleteUser);

module.exports = router;