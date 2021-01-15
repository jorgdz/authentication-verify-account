'use strict'
const { check } = require('express-validator')

module.exports = [
    check('username').notEmpty().withMessage('Proporcione un correo o su nombre de usuario.'),
    check('password').notEmpty().withMessage('La contraseña es requerida.')
]
