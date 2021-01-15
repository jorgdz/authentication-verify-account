'use strict'

const express = require('express')
const router = express.Router()
const { auth } = require('../middleware/auth')

/* GET home page. */
router.get('/', auth, function(req, res, next) {
  res.render('index', { title: 'Express' })
})

module.exports = router
