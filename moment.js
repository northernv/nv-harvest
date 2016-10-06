'use strict'
const moment = require('moment')
const config = require('./config')

const startOfWeek = config.get('startOfWeek')

// Changed start of week to monday
moment.locale('us', {
  week: {
    dow: startOfWeek
  }
})

module.exports = moment
