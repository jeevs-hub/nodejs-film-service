"use strict";

const getFilmService = require('./get-films/get-films-service')
const userFilmService = require('./user-films/user-films-service')

module.exports = (app) => {
    app.use('/', userFilmService);
    app.use('/search', getFilmService);
}