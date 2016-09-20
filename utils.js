'use strict'
const config = require('./config')
const axios = require('axios')
const moment = require('moment')
const jira = config.get('JIRA_URL')

module.exports = {
  getJiraAuth,
  roundUp,
  isJiraTicket,
  getHarvestTime,
  getUsername,
  addWorklog,
  getJiraHours,
  getComment
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
