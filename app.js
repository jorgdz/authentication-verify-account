var createError = require('http-errors')
var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')
const hbs = require('hbs')
const session = require('express-session')
const flash = require('connect-flash')

var indexRouter = require('./routes/index')
var usersRouter = require('./routes/users')

var app = express()
const db = require('./lib/db')

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'hbs')
hbs.registerPartials(__dirname + '/views/partials')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(
  session({
    secret: "authsession",
    resave: false,
    saveUninitialized: false,
  })
)
app.use(flash())
app.use(express.static(path.join(__dirname, 'public')))

app.use((req, res, next) => {
  app.locals.message = req.flash('message')
  app.locals.success = req.flash('success')
  app.locals.error = req.flash('error')
  app.locals.errorsValidator = req.flash('errorsValidator')
  next()
})

db.sequelize.sync()

app.use('/', indexRouter)
app.use('/users', usersRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404))
})

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app
