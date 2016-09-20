'use strict'
const moment = require('moment')
const startOfWeek = 1 // Monday

// Changed start of week to monday
moment.locale('us', {
  week: {
    dow: startOfWeek
  }
})

module.exports = moment
