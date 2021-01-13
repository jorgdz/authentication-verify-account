'use strict'

module.exports = {
    db: {
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        dialect: 'postgres',
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    },
    mail: {
        service: process.env.MAIL_MAILER,
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
        port: process.env.MAIL_PORT,
        host: process.env.MAIL_HOST,
        secure: process.env.MAIL_SECURE,
    }
}
