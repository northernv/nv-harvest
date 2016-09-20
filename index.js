#!/usr/bin/env node
'use strict'

/**
 * My time pulled from Harvest
 */

//
const async = require('async')
const chalk = require('chalk')
const _ = require('lodash')

const config = require('./config')
const moment = require('./moment')
const harvest = require('./harvest')
const util = require('./utils')

let start = config.get('START')
let end = config.get('END')
const dateFormat = 'YYYYMMDD'

if (!start || !end) {
  // use moment
  start = moment().startOf('week')
  end = moment(start).add(6, 'd').format(dateFormat)
  start = start.format(dateFormat)
}

// Temp overrides
// start="20150112"
// end="20150118"

/**
 *
 * Main Program
 *
 */
async.waterfall([
  getAllTasks,
  getTimeEntries
], function (err, result) {
  process.exit(0)
})

function getAllTasks (cb) {
  Tasks.list({}, function(err, tasks) {
    if (err) {
        console.log(chalk.red(err))
        cb(err)
    }
    var mappedTasks = _.reduce(tasks, function (memo, data) {
      memo[data.task.id] = data.task.name
      return memo
    }, {})
    cb(err, mappedTasks)
  })
}

function getTimeEntries(taskCodes, cb) {

  harvest.getTimeEntries(start, end, function(err, tasks) {
      if (err) {
          console.log(chalk.red(err))
          cb(err)
      }

      var times = {}

      // Process times
      tasks.forEach(function(task) {
        var entry = task.day_entry
        var day = entry.spent_at
        var num = entry.hours
        var up = util.roundUp(num)
        var taskType = taskCodes[entry.task_id]

        // Init array if doesn't exists
        if (!Array.isArray(times[day])) times[day] = []

        times[day].push({time: up, note: entry.notes, taskType: taskType} )
      })

      var grandTotal = 0

      _.each(times, function(day, date){
          console.log(chalk.underline(date, moment(date).format('ddd')))
          var sorted = _.sortBy(day, 'taskType')
          var grouped = _.groupBy(sorted, 'taskType')
          var total = 0

          _.each(grouped, function(tasks, taskType){
             var subtotal = _.reduce(tasks, function (memo, t) {
               memo+=parseFloat(t.time)
               return memo
             }, 0)

              console.log(chalk.yellow('----- ' + taskType + ' ( ' + subtotal + ' ) -----'))

              tasks.forEach(function(d){
                  total+=parseFloat(d.time)
                  console.log(d.time, d.note)
              })

          })

          console.log(chalk.cyan.bold('== ', total))
          console.log('')
          grandTotal += total
      })

      console.log('')
      console.log(chalk.green.bold('Total Hours: ', grandTotal))
      cb()
  })
}

