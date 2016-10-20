#!/usr/bin/env node
'use strict'

const _ = require('lodash')
const chalk = require('chalk')
const Bluebird = require('bluebird')

const util = require('./utils')
const harvest = require('./harvest')

const dateRange = util.getDateRange()
const start = dateRange.start
const end = dateRange.end

const client = util.getJiraClient()

const timeEntries = harvest.getTimeEntries(start, end)
  .then(function (tasks) {
    // Process times
    return tasks.map(function (task) {
      let entry = task.day_entry
      let day = entry.spent_at
      let num = entry.hours
      let up = util.roundUp(num)
      let ticket = entry.notes.split(' ')[0]

      let date = new Date(day)

      return {
        timeSpent: up,
        comment: entry.notes,
        ticket: ticket,
        started: date.toISOString()
      }
    })
  })

console.log(chalk.yellow('....Fetching Jira Worklogs... Patience'))
const jiraWorkLogs = Bluebird.resolve(client)
  .then(function (_client) {
    return Bluebird.reduce(timeEntries, function (memo, entry) {
      const ticket = entry.ticket
      if (!util.isJiraTicket(ticket)) {
        return memo
      }
      if (memo[ticket]) {
        return memo
      }

      return util.getJiraWorklog(_client, ticket)
        .then(function (res) {
          memo[ticket] = res
          return memo
        })
    }, {})
  })

Bluebird.join(timeEntries, jiraWorkLogs, function (t, j) {
  t.forEach(function (data) {
    if (!util.isJiraTicket(data.ticket)) {
      return
    }

    const ticket = j[data.ticket]
    postTimeToJira(data, ticket)
      .then(function (message) {
        console.log(message)
      })
  })
})

function postTimeToJira (data, ticket) {
  let time = util.getHarvestTime(data.started)
  let username = util.getUsername()

  let found = _.find(ticket.worklogs, function (log) {
    // Not the same author, get me outta here
    if (log.author.name !== username) {
      return false
    }

    if (!time.isSame(log.started, 'day')) {
      return false
    }

    let jiraHours = util.getJiraHours(log.timeSpentSeconds)

    return log.comment === util.getComment(data) &&
      jiraHours === data.timeSpent
  })
  if (found) {
    return Bluebird.resolve(chalk.red('== Skipping == ' + found.comment))
  }
  return util.addWorklog(client, data).then(res => chalk.yellow(res))
}
