'use strict'
const { body, check } = require('express-validator')
const db = require('../../db')
const User = db.users

const messageConfirmPassword = 'La confirmación de la contraseña no coincide con la contraseña.'
const messageEmailUsed = 'El correo ya está en uso.'
const messageUsernameUsed = 'El nombre de usuario ya está en uso.'

module.exports = [
    body('email').isEmail().withMessage('El correo no es válido.'),
    check('username').notEmpty().withMessage('El nombre de usuario es obligatorio.'),
    body('passwordConfirmation').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error(messageConfirmPassword);
        }

        return true
    }).withMessage(messageConfirmPassword),
    check('email').custom(value => {
        return User.findAll({
            where: {
                email: value
            }
        }).then(user => {
            if (user[0]) {
                throw new Error(messageEmailUsed)
            }
        })
    }),
    check('password')
        .not()
        .isIn(['123', 'password', 'god'])
        .withMessage('No use una palabra común como contraseña')
        .matches(/^(?=.{10,}$)(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*\W).*$/)
        .withMessage('La contraseña debe tener más de 10 caracteres y contener números, caracteres especiales, mayúsculas y minúsculas.'),
    check('username').custom(value => {
        return User.findAll({
            where: {
                username: value
            }
        }).then(user => {
            if (user[0]) {
                throw new Error(messageUsernameUsed)
            }
        })
    })
]
