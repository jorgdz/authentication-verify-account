'use strict' 

const express = require('express')
const router = express.Router()
const { auth } = require('../middleware/auth')
const realEmail = require('../lib/validator/real-email')

/* GET home page. */
router.get('/', auth, function (req, res, next) {
  res.render('index', {title: 'Express'})
})

router.post('/api/verify-email', async function (req, res, next) {
  const data = await realEmail(req.body.email)

  if (!data.smtpCheck || !data.formatCheck) {
    res.send({error: 'Invalid error.'}).status(400)
  }

  res.send({ status: data.smtpCheck })
})

module.exports = router
