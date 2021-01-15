'use strict'

const express = require('express')
const router = express.Router()
const { validationResult } = require('express-validator')

const db = require('../../lib/db')
const User = db.users

const validatorVerifyAcc = require('../../lib/validator/verify-acc')

const staticFiles = require('../../lib/static-files-routes')

const { guest } = require('../../middleware/guest')

/* GET verify page. */
router.get('/verify/:id/:token', guest, validatorVerifyAcc, async function (req, res, next) {
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

/* GET form reset pass page. */
router.get('/password/reset/:id/:token', guest, validatorVerifyAcc, async function (req, res, next) {
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

module.exports = router
