const express = require('express');
const router = express.Router();
const db = require('../lib/db')
const User = db.users

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
