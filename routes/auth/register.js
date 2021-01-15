'use strict'

const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const randomToken = require('rand-token')
const { validationResult } = require('express-validator')

const db = require('../../lib/db')
const User = db.users

const send = require('../../lib/send-mail')
const templateVerify = require('../../lib/send-mail/templateVerify')

const validatorRegister = require('../../lib/validator/register')

const staticFiles = require('../../lib/static-files-routes')

const { guest } = require('../../middleware/guest')

/* GET register page. */
router.get('/', guest, function (req, res, next) {
  res.render('auth/register', { title: 'Register', css: staticFiles.cssAuth })
})

router.post('/', guest, validatorRegister, async function (req, res, next) {
  const code = randomToken.generate(30)
  const passwordEncrypt = await bcrypt.hash(req.body.password, 10)
  
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    console.log(errors.array())

    req.flash('old', req.body)
    req.flash('errorsValidator', errors.array())
    res.redirect('/register')
  } else {
    const register = await User.create({
      email: req.body.email,
      username: req.body.username,
      password: passwordEncrypt,
      estado: false,
      verification_code: code
    })
  
    const sendEmail = await send(register, 'TEST - CONFIRMA TU CORREO ✔', templateVerify)
    
    if(sendEmail.messageId && register.id) {
      console.log(sendEmail.messageId)
  
      req.flash('message', 'Su cuenta ha sido creada con éxito, por favor verifique su correo.')
      res.redirect('/register')
    } else {
      req.flash('error', 'Ha ocurrido un error al crear la cuenta de usuario, por favor intente luego.')
      res.redirect('/register')
    }
  }
})

module.exports = router
