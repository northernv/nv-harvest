'use strict'
const axios = require('axios')

const config = require('./config')
const moment = require('./moment')
const jira = config.get('JIRA_URL')

const dateFormat = config.get('dateFormat')

module.exports = {
  getDateRange,
  getJiraAuth,
  roundUp,
  isJiraTicket,
  getHarvestTime,
  getUsername,
  addWorklog,
  getJiraHours,
  getComment
}

function getDateRange () {
  if (config.get('lastweek')) return getLastWeekDates()
  if (config.get('yesterday')) return getYesterdayDates()

  return getThisWeekDates()
}

function getYesterdayDates () {
  const today = moment().startOf('day')
  const yesterday = moment(today).subtract(1, 'd')

  return {
    start: getFormatted(yesterday),
    end: getFormatted(yesterday)
  }
}

function getStartOfThisWeek () {
  return moment().startOf('week')
}

function getEndOfWeek (start) {
  return moment(start).add(6, 'd')
}

function getFormatted (date) {
  return date.format(dateFormat)
}

function getThisWeekDates () {
  const startOfWeek = getStartOfThisWeek()
  const endOfWeek = getEndOfWeek(startOfWeek)

  return {
    start: config.get('START') || getFormatted(startOfWeek),
    end: config.get('END') || getFormatted(endOfWeek)
  }
}

function getLastWeekDates () {
  const startOfThisWeek = getStartOfThisWeek()
  const startOfLastWeek = moment(startOfThisWeek).subtract(7, 'd')

  const endOfLastWeek = getEndOfWeek(startOfLastWeek)

  return {
    start: getFormatted(startOfLastWeek),
    end: getFormatted(endOfLastWeek)
  }
}

function getJiraAuth () {
  return {
    username: getUsername(),
    password: config.get('JIRA_PASSWORD'),
    sendImmediately: true
  }
}

function roundUp (num) {
  return (Math.ceil(num * 4) / 4).toFixed(2)
}

function isJiraTicket (ticket) {
  return /^\w{2,}-\d{1,}$/i.test(ticket)
}

function getHarvestTime (time) {
  var parts = time.split('T')
  var m = moment(parts[0])
  return m
}

function getUsername () {
  return config.get('JIRA_USERNAME')
}

function addWorklog (data) {
  const time = getHarvestTime(data.started)
  const formattedTime = time.format('YYYY-MM-DDTHH:MM:SS.000ZZ')
  const comment = getComment(data)
  const req = {
    comment: comment,
    started: formattedTime,
    timeSpent: data.timeSpent + 'h'
  }
  return axios.post(jira + 'issue/' + data.ticket + '/worklog?adjustEstimate=auto', req, {
    auth: getJiraAuth()
  })
  .then(() => '== Adding == ' + comment)
}

function getJiraHours (seconds) {
  var dur = moment.duration(seconds, 'seconds')
  return dur.asHours().toFixed(2)
}

function getComment (data) {
  return data.timeSpent + ' ' + data.comment
}
