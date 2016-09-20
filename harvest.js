'use strict'
const Harvest = require('harvest')
const config = require('./config')
const subdomain = config.get('SUBDOMAIN')
const email = config.get('EMAIL')
const password = config.get('PASSWORD')
const projectId = config.get('PROJECT')
const harvest = Harvest({subdomain: subdomain, email: email, password: password})
const Reports = harvest.Reports

module.exports = {
  getTimeEntries
}

function getTimeEntries (start, end, cb) {
  Reports.timeEntriesByProject({
    project_id: projectId,
    from: start,
    to: end
  }, cb)
}
