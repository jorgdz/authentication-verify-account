'use strict'

const config = require('../../config/config').db
const Sequelize = require('sequelize')
const setupDatabase = require('./db')

const sequelize = setupDatabase(config)

const db = {}

db.Sequelize = Sequelize
db.sequelize = sequelize

db.users = require('../../models/user')(sequelize, Sequelize)

module.exports = db
