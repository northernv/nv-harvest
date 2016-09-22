#!/usr/bin/env node
'use strict'
/**
 * My time pulled from Harvest
 */
const axios = require('axios')
const _ = require('lodash')

const config = require('./config')
const util = require('./utils')
const moment = require('./moment')
const harvest = require('./harvest')

const jira = config.get('JIRA_URL')
const dateFormat = 'YYYYMMDD'

let start = config.get('START')
let end = config.get('END')

if (!start || !end) {
  // use moment
  start = moment().subtract(1, 'd').startOf('day')
  end = moment(start).endOf('day').format(dateFormat)
  start = start.format(dateFormat)
}

harvest.getTimeEntries(start, end, function (err, tasks) {
  if (err) throw new Error(err)

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
        return '== Skipping == ' + found.comment
      }

      return util.addWorklog(data)
    })
}
