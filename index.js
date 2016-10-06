#!/usr/bin/env node
'use strict'

const Bluebird = require('bluebird')

const harvest = require('./harvest')
const util = require('./utils')

const dateRange = util.getDateRange()
const start = dateRange.start
const end = dateRange.end

const tasksPromise = harvest.getTaskMap()
const entriesPromise = harvest.getTimeEntries(start, end)

Bluebird.join(tasksPromise, entriesPromise, function (tasks, entries) {
  const times = harvest.reduceEntries(entries, tasks)
  harvest.printTimesheet(times)
})
