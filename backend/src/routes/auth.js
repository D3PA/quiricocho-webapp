const express = require('express');
const { login, register, verifyToken } = require('../controllers/authController');
const { loginValidation, registerValidation } = require('../middleware/validators');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/login
router.post('/login', loginValidation, login);

// POST /api/auth/register
router.post('/register', registerValidation, register);

// GET /api/auth/verify (protegida)
router.get('/verify', authenticateToken, verifyToken);

module.exports = router;