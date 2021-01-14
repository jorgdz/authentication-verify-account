'use strict'

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt')
const randomToken = require('rand-token')
const { validationResult } = require('express-validator')

const db = require('../lib/db')
const User = db.users

const send = require('../lib/send-mail')
const templateVerify = require('../lib/send-mail/templateVerify')
const templateResetPassword = require('../lib/send-mail/templateResetPassword')

const validatorRegister = require('../lib/validator/register')
const validatorForgot = require('../lib/validator/forgot')
const validatorReset = require('../lib/validator/reset-password')
const validatorVerifyAcc = require('../lib/validator/verify-acc')

const staticFiles = require('../lib/static-files-routes')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET login page. */
router.get('/login', function (req, res, next) {
  res.render('auth/login', { title: 'Login', css: staticFiles.cssAuth });
})

/* GET register page. */
router.get('/register', function (req, res, next) {
  res.render('auth/register', { title: 'Register', css: staticFiles.cssAuth });
})

/* GET form reset pass page. */
router.get('/password/reset/:id/:token', validatorVerifyAcc, async function (req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.redirect('/')
  } else {
    const user = await User.findAll({
      where: {
        id: req.params.id,
        password_reset_code: req.params.token
      }
    })
  
    if(user[0]) {
      res.render('auth/password-reset', {
        title: 'Reset Password', 
        _email: user[0].email,
        _id: user[0].id,
        urlback: req.url,
        css: staticFiles.cssAuth
      })
    } else {
      res.redirect('/')
    }
  }
})

/* GET forgot page. */
router.get('/password/reset', function (req, res, next) {
  res.render('auth/password-send', { title: 'Forgot Password', css: staticFiles.cssAuth });
})

/* GET verify page. */
router.get('/verify/:id/:token', validatorVerifyAcc, async function (req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.redirect('/')
  } else {
    const user = await User.findAll({
      where: {
        id: req.params.id,
        verification_code: req.params.token
      }
    })
  
    if (user[0]) {
      const userVerify = await User.update({ verification_code: '', estado: true }, {
        where: { id: user[0].id }
      })
  
      if (userVerify) {
        console.log(userVerify)
  
        req.flash('success', 'Felicidades tu cuenta ha sido verificada, por favor ingresa con tus credenciales !!')
        res.redirect('/login')
      }
    } else {
      res.redirect('/')
    }
  }
})

router.post('/register', validatorRegister, async function (req, res, next) {
  const code = randomToken.generate(30)
  const passwordEncrypt = await bcrypt.hash(req.body.password, 10)
  
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    console.log(errors.array())

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

router.post('/password/reset', validatorForgot, async function (req, res, next) {
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

router.post('/password/change/:id', validatorReset, async function (req, res, next) {
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

router.post('/login', async function (req, res, next) {
  res.send('Suave loco, aún no está terminado.')
})

module.exports = router;
