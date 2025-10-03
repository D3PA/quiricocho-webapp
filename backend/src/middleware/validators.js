const { body } = require('express-validator');

// validaciones para login y registro
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Debe ser un email valido'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres')
];

const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Debe ser un email valido'),
  body('password')
    .isLength({ min: 3 }) // (6 original) cambiando a 3 para testing
    .withMessage('La contraseña debe tener al menos 3 caracteres') // (6 original)
    // .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/) 
    // .withMessage('La contraseña debe contener al menos una mayuscula, una minuscula y un numero')
];

// validaciones para actualizar jugadores
const playerUpdateValidation = [
  body('long_name')
    .optional()
    .isLength({ min: 2, max: 255 })
    .withMessage('El nombre debe tener entre 2 y 255 caracteres'),
  body('overall')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('El overall debe ser entre 0 y 100'),
  body('age')
    .optional()
    .isInt({ min: 16, max: 60 })
    .withMessage('La edad debe ser entre 16 y 60')
];

const playerCreateValidation = [
  body('long_name')
    .isLength({ min: 2, max: 255 })
    .withMessage('El nombre debe tener entre 2 y 255 caracteres'),
  body('player_positions')
    .notEmpty()
    .withMessage('La posición es requerida'),
  body('overall')
    .isInt({ min: 0, max: 100 })
    .withMessage('El overall debe ser entre 0 y 100'),
  body('age')
    .isInt({ min: 16, max: 60 })
    .withMessage('La edad debe ser entre 16 y 60')
];

module.exports = {
  loginValidation,
  registerValidation,
  playerUpdateValidation,
  playerCreateValidation
};