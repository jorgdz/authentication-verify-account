'use strict'

const mail = require('./mail')
const config = require('../../config/config').mail
const templateVerify = require('./templateVerify')

module.exports = async function (userRegister) {
    return await mail.sendMail({
        from: config.user,
        to: userRegister.email,
        subject: "TEST - CONFIRMA TU CORREO ✔",
        html: templateVerify(userRegister)
    })
}
