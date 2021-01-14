'use strict'

const hbs = require('hbs')

hbs.registerHelper('binding', function (body, field) {
    if (body.length > 0) {
        return body[0][field] ? body[0][field] : ''
    }
    return ''
})
