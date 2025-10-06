const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { User } = require('../models');

// generar token JWT
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { 
    expiresIn: process.env.JWT_EXPIRES_IN || '24h' 
  });
};

// login de usuario
const login = async (req, res) => {
  try {
    // validar campos
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Datos de entrada invalidos',
        details: errors.array(),
        code: 'VALIDATION_ERROR'
      });
    }

    const { email, password } = req.body;

    // buscar usuario
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        error: 'Credenciales invalidas',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // validar password
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Credenciales invalidas',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // generar token
    const token = generateToken(user.id);

    res.status(200).json({
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        is_admin: user.is_admin,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      code: 'LOGIN_ERROR'
    });
  }
};

// registro de usuario
const register = async (req, res) => {
  try {
    // validar campos
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Datos de entrada invalidos',
        details: errors.array(),
        code: 'VALIDATION_ERROR'
      });
    }

    const { email, password, name } = req.body;

    // verificar si el usuario ya existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        error: 'El usuario ya existe',
        code: 'USER_EXISTS'
      });
    }

    // crear usuario
    const user = await User.create({ email, password, name });

    // generar token
    const token = generateToken(user.id);

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        is_admin: user.is_admin,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      code: 'REGISTER_ERROR'
    });
  }
};

// verificar token (para frontend)
const verifyToken = async (req, res) => {
  try {
    res.status(200).json({
      valid: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        is_admin: req.user.is_admin,
        createdAt: req.user.createdAt
      }
    });
  } catch (error) {
    console.error('Error verificando token:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      code: 'VERIFY_ERROR'
    });
  }
};

module.exports = {
  login,
  register,
  verifyToken
};