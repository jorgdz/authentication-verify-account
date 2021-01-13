'use strict'

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt')
const randomToken = require('rand-token')

const db = require('../lib/db')
const User = db.users
const send = require('../lib/send-mail')

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

/* GET verify page. */
router.get('/verify/:id/:token', function (req, res, next) {
  console.log(req.params)
  res.send('Cuenta verificada !!');
})

router.post('/register', async function (req, res, next) {
  const code = randomToken.generate(30)
  const passwordEncrypt = await bcrypt.hash(req.body.password, 10)
  
  const user = {
    email: req.body.email,
    username: req.body.username,
    password: passwordEncrypt,
    estado: false,
    verification_code: code
  }

  const register = await User.create(user)
  const sendEmail = await send(register)
  
  if(sendEmail.messageId && register.id) {
    console.log(sendEmail.messageId)

    req.flash('message', 'Su cuenta ha sido creada con éxito, por favor verifique su correo.')
    res.redirect('/register')
  } else {
    req.flash('error', 'Ha ocurrido un error al crear la cuenta de usuario, por favor intente luego.')
    res.redirect('/register')
  } 
})

module.exports = router;
