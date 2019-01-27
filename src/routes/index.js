"use strict";

const getFilmService = require('../get-films/get-films-service')

module.exports = (app) => {
    app.use('/', getFilmService)
}