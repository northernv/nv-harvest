'use strict'
const Harvest = require('harvest')
const Bluebird = require('bluebird')
const _ = require('lodash')
const chalk = require('chalk')

const moment = require('./moment')
const util = require('./utils')
const config = require('./config')
const subdomain = config.get('SUBDOMAIN')
const email = config.get('EMAIL')
const password = config.get('PASSWORD')
const projectId = config.get('PROJECT')
const projectIds = config.get('PROJECTS')
const harvest = Harvest({subdomain: subdomain, email: email, password: password})
const Reports = harvest.Reports
const Tasks = harvest.Tasks

const timeEntriesByProject = Bluebird.promisify(Reports.timeEntriesByProject)
const taskList = Bluebird.promisify(Tasks.list)

module.exports = {
  printTimesheet,
  reduceEntries,
  getTimeEntries,
  getTaskMap
}

function getTimeEntries (start, end) {
  return Bluebird.all(projectIds.map(id => {
    return timeEntriesByProject({
      project_id: id,
      from: start,
      to: end
    })
  }))
  .then(res => {
    return _.flatten(res)
  })
}

function getTaskMap () {
  return taskList({})
    .then(function (tasks) {
      return _.reduce(tasks, function (memo, data) {
        memo[data.task.id] = data.task.name
        return memo
      }, {})
    })
}

function reduceEntries (entries, taskCodes) {
  return _.reduce(entries, function (memo, e) {
    const entry = e.day_entry
    const day = entry.spent_at
    const num = entry.hours
    const up = util.roundUp(num)
    const taskType = taskCodes[entry.task_id]
    console.log(e)

    // Init array if doesn't exists
    if (!Array.isArray(memo[day])) memo[day] = []

    memo[day].push({
      time: up,
      note: entry.notes,
      taskType: taskType,
      project: entry.project_id
    })

    return memo
  }, {})
}

function printTimesheet (times) {
  var grandTotal = 0

  _.each(times, function (day, date) {
    console.log(chalk.underline(date, moment(date).format('ddd')))
    var sorted = _.sortBy(day, 'taskType')
    var grouped = _.groupBy(sorted, 'taskType')
    var total = 0

    _.each(grouped, function (tasks, taskType) {
      var subtotal = _.reduce(tasks, function (memo, t) {
        memo += parseFloat(t.time)
        return memo
      }, 0)

      console.log(chalk.yellow('----- ' + taskType + ' ( ' + subtotal + ' ) -----'))

      tasks.forEach(function (d) {
        total += parseFloat(d.time)
        console.log(d.project, d.time, d.note)
      })
    })

    console.log(chalk.cyan.bold('== ', total))
    console.log('')
    grandTotal += total
  })

  console.log('')
  console.log(chalk.green.bold('Total Hours: ', grandTotal))
}
