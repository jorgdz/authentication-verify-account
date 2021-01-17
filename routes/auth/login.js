"use strict";

const express = require('express')
const router = express.Router()
const passport = require('passport')

const staticFiles = require('../../lib/static-files-routes')

const { guest } = require('../../middleware/guest')

/* GET login page. */
router.get('/', guest, function (req, res, next) {
	res.render('auth/login', {
		title: 'Login',
		css: staticFiles.cssAuth
	})
})

router.post('/', guest, passport.authenticate('local', {
	successRedirect: '/',
	failureRedirect: '/login',
	failureFlash: true
}))

module.exports = router
