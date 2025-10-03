const { body } = require('express-validator');

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

module.exports = {
  loginValidation,
  registerValidation
};