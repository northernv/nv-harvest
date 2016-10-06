#!/usr/bin/env node
'use strict'

const axios = require('axios')
const _ = require('lodash')
const chalk = require('chalk')

const config = require('./config')
const util = require('./utils')
const harvest = require('./harvest')

const jira = config.get('JIRA_URL')

const dateRange = util.getDateRange()
const start = dateRange.start
const end = dateRange.end

harvest.getTimeEntries(start, end)
  .then(function (tasks) {
    // Process times
    tasks.forEach(function (task) {
      let entry = task.day_entry
      let day = entry.spent_at
      let num = entry.hours
      let up = util.roundUp(num)
      let ticket = entry.notes.split(' ')[0]

      let date = new Date(day)

      let data = {
        timeSpent: up,
        comment: entry.notes,
        ticket: ticket,
        started: date.toISOString()
      }
      if (util.isJiraTicket(data.ticket)) {
        postTimeToJira(data)
          .then(function (res) {
            console.log(res)
          })
          .catch(function (err) {
            console.log(err)
          })
      }
    })
  })

function postTimeToJira (data) {
  let time = util.getHarvestTime(data.started)
  let username = util.getUsername()

  return axios.get(jira + 'issue/' + data.ticket + '/worklog', {
    auth: util.getJiraAuth()
  })
    .then(function (res) {
      let found = _.find(res.data.worklogs, function (log) {
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
        return chalk.red('== Skipping == ' + found.comment)
      }

      return util.addWorklog(data).then(res => chalk.yellow(res))
    })
}
