var createError = require('http-errors')
var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')

const hbs = require('hbs')
require('./lib/helper-hbs')

var indexRouter = require('./routes/index')
var usersRouter = require('./routes/users')
var loginRouter = require('./routes/auth/login')
var registerRouter = require('./routes/auth/register')
var verificationRouter = require('./routes/auth/verification')
var resetPasswordRouter = require('./routes/auth/reset-password')

const session = require('express-session')
const flash = require('connect-flash')

var app = express()

const db = require('./lib/db')

const passport = require('passport')
const auth = require('./lib/passport')

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'hbs')
hbs.registerPartials(__dirname + '/views/partials')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({
  extended: false
}))
app.use(cookieParser())

app.use(session({
  secret: 'authentication.verify.session',
  resave: false,
  saveUninitialized: false,
}))

app.use(flash())
app.use(passport.initialize())
app.use(passport.session())
app.use(express.static(path.join(__dirname, 'public')))

app.use((req, res, next) => {
  app.locals.message = req.flash('message')
  app.locals.success = req.flash('success')
  app.locals.error = req.flash('error')
  app.locals.errorsValidator = req.flash('errorsValidator')
  app.locals.old = req.flash('old')
  app.locals.user = req.user
  next()
})

db.sequelize.sync()

passport.use('local', auth.localStrategy)
passport.deserializeUser(auth.deserializeUser)
passport.serializeUser(auth.serializeUser)

app.use('/', indexRouter)
app.use('/login', loginRouter)
app.use('/register', registerRouter)
app.use('/confirm', verificationRouter)
app.use('/password', resetPasswordRouter)
app.use('/users', usersRouter)

app.get('/logout', function (req, res) {
  req.logOut()
  res.redirect('/login')
})

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app