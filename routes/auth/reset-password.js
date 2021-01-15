'use strict'

const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const randomToken = require('rand-token')
const { validationResult } = require('express-validator')

const db = require('../../lib/db')
const User = db.users

const send = require('../../lib/send-mail')
const templateResetPassword = require('../../lib/send-mail/templateResetPassword')

const validatorForgot = require('../../lib/validator/forgot')
const validatorReset = require('../../lib/validator/reset-password')

const staticFiles = require('../../lib/static-files-routes')

const { guest } = require('../../middleware/guest')

/* GET forgot page. */
router.get('/reset', guest, function (req, res, next) {
  res.render('auth/password-send', { title: 'Forgot Password', css: staticFiles.cssAuth })
})

/***
 * Send mail for change password
 */
router.post('/reset', guest, validatorForgot, async function (req, res, next) {
  const code = randomToken.generate(30)
  
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    req.flash('errorsValidator', errors.array())
    res.redirect('/password/reset')
  } else {
    const user = await User.findAll({
      where: {
        email: req.body.email
      }
    })

    if (user[0]) {
      const userUpdated = await User.update({ password_reset_code: code }, {
        where: { id: user[0].id }
      })

      if (userUpdated) {
        const userReset = await User.findAll({
          where: {
            id: user[0].id
          }
        })
        
        const sendEmail = await send(userReset[0], 'TEST - CAMBIO DE CONTRASEÑA ✔', templateResetPassword)
        
        if(sendEmail.messageId) {
          req.flash('message', 'Te hemos enviado un correo de reseteo de contraseña, por favor revisa tu bandeja de entrada y correo spam.')
          res.redirect('/password/reset') 
        }
      }
    } else {
      req.flash('error', 'No hemos encontrado un correo válido para resetear la contraseña.')
      res.redirect('/password/reset')
    }
  }
})

/**
 * Change your password
 */
router.post('/change/:id', guest, validatorReset, async function (req, res, next) {
  const user = await User.findAll({
    where: {
      id: req.params.id,
      email: req.body.email
    }
  })
  
  if (user[0]) {
    const errors = validationResult(req)
    
    if (!errors.isEmpty()) {
      req.flash('errorsValidator', errors.array())
      res.redirect(req.body.urlback)
    } else {
      const passwordEncrypt = await bcrypt.hash(req.body.password, 10)
    
      const userUpdated = await User.update({ password_reset_code: '', password: passwordEncrypt }, {
        where: { id: user[0].id }
      })
  
      if (userUpdated) {
        req.flash('success', 'Tu contraseña ha sido cambiada con éxito.')
        res.redirect('/login') 
      }
    }
  } else {
    req.flash('message', 'Digite su correo para el cambio de contraseña.')
    res.redirect('/password/reset')
  }
})

module.exports = router
