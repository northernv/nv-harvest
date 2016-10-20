'use strict'
const axios = require('axios')
const _ = require('lodash')

const config = require('./config')
const moment = require('./moment')
const jira = config.get('JIRA_URL')

const dateFormat = config.get('dateFormat')

module.exports = {
  getJiraClient,
  getJiraCookies,
  getJiraWorklog,
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

function getJiraClient () {
  return axios.create({
    baseURL: jira,
    auth: getJiraAuth()
  })
}

function getJiraCookies (client) {
  const url = 'auth/1/session'
  const body = getJiraAuth()
  return client.post(url, body)
    .then(function (res) {
      var cookies = _.get(res.headers, 'set-cookie')
      if (cookies) {
        const result = cookies.reduce(function (memo, cookie) {
          const infoString = (cookie + '').split(';').shift()
          const infoArr = infoString.split('=')
          if (infoArr[0] === 'JSESSIONID') {
            memo = infoString
          }
          return memo
        }, '')
        return result
      }
    })
    .catch(function (err) {
      console.log(err)
    })
}

function getJiraWorklog (client, issue) {
  const url = 'api/2/issue/' + issue + '/worklog'
  return client.get(url)
    .then(response => {
      return response.data
    })
    .catch(function (err) {
      console.log(err)
    })
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
    sendImmediately: true,
    username: getUsername(),
    password: config.get('JIRA_PASSWORD')
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

function addWorklog (client, data) {
  const time = getHarvestTime(data.started)
  const formattedTime = time.format('YYYY-MM-DDTHH:MM:SS.000ZZ')
  const comment = getComment(data)
  const req = {
    comment: comment,
    started: formattedTime,
    timeSpent: data.timeSpent + 'h'
  }
  const url = 'api/2/issue/' + data.ticket + '/worklog?adjustEstimate=auto'
  return client.post(url, req)
    .then(() => '== Adding == ' + comment)
    .catch(console.log)
}

function getJiraHours (seconds) {
  var dur = moment.duration(seconds, 'seconds')
  return dur.asHours().toFixed(2)
}

function getComment (data) {
  return data.timeSpent + ' ' + data.comment
}
