'use strict'

module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define('users', {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        email: {
            type: Sequelize.STRING,
            allowNull: false
        },
        username: {
            type: Sequelize.STRING,
            allowNull: false
        },
        password: {
            type: Sequelize.STRING,
            allowNull: false
        },
        nombre_imagen: {
            type: Sequelize.TEXT,
        },
        url_imagen: {
            type: Sequelize.STRING,
        },
        verification_code: {
            type: Sequelize.STRING,
        },
        estado: {
            type: Sequelize.BOOLEAN,
        }
    })

    return User
}
