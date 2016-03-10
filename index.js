#!/usr/bin/env node

/**
 * My time pulled from Harvest
 */

//
var path        = require('path'),
    async       = require('async'),
    moment      = require('moment'),
    chalk       = require('chalk'),
    configFileName = '.timesheet',
    userEnvFile = path.normalize(process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'] + '/' + configFileName),
    nconf       = require('nconf');
// Command line args take highest precedence
nconf.argv();

// Look for .timesheet in current directory and walk up the tree
// this allows for adding project specific .timesheet files..
nconf.file('project', {
    file: configFileName,
    search: true
});

// Fallback to global config in user's home folder.
nconf.file('user', userEnvFile);

var subdomain   = nconf.get('SUBDOMAIN'),
    email       = nconf.get('EMAIL'),
    password    = nconf.get('PASSWORD'),
    projectId   = nconf.get('PROJECT'),
    start       = nconf.get('START'),
    end         = nconf.get('END'),
    meetingCode = nconf.get('MEETING_CODE'),
    ticketCode  = nconf.get('TICKET_CODE'),
    dateFormat  = 'YYYYMMDD',
    Harvest     = require('harvest'),
    harvest     = Harvest({subdomain: subdomain, email: email, password: password}),
    Reports     = harvest.Reports,
    Tasks       = harvest.Tasks,
    startOfWeek = 1, // Monday
    _           = require('lodash');


// Changed start of week to monday
moment.locale('us', {
  week: {
    dow: startOfWeek
  }
});

if (!start || !end) {
  // use moment
  start = moment().startOf('week');
  end   = moment(start).add(6, 'd').format(dateFormat);
  start = start.format(dateFormat);
}

// Temp overrides
//start="20150112";
//end="20150118";

/**
 *
 * Main Program
 *
 */
async.waterfall([
  getAllTasks,
  getTimeEntries
], function (err, result) {
  process.exit(0);
})

function getAllTasks(cb) {
  Tasks.list({}, function(err, tasks) {
    if (err) {
        console.log(chalk.red(err));
        cb(err);
    }
    var mappedTasks = _.reduce(tasks, function (memo, data) {
      memo[data.task.id] = data.task.name
      return memo;
    }, {});
    cb(err, mappedTasks);
  });
}

function getTimeEntries(taskCodes, cb) {

  Reports.timeEntriesByProject({
    project_id: projectId,
    from: start,
    to: end
  }, function(err, tasks) {
      if (err) {
          console.log(chalk.red(err));
          cb(err);
      }

      var times = {};

      // Process times
      tasks.forEach(function(task) {
        var entry = task.day_entry;
        var day = entry.spent_at;
        var num = entry.hours;
        var up = (Math.ceil(num * 4) / 4).toFixed(2);
        var taskType = taskCodes[entry.task_id];

        // Init array if doesn't exists
        if (!Array.isArray(times[day])) times[day] = [];

        times[day].push({time: up, note: entry.notes, taskType: taskType} );
      });

      var grandTotal = 0;

      _.each(times, function(day, date){
          console.log(chalk.underline(date, moment(date).format('ddd')));
          var sorted = _.sortBy(day, 'taskType');
          var grouped = _.groupBy(sorted, 'taskType');
          var total = 0;

          _.each(grouped, function(tasks, taskType){
              console.log(chalk.yellow('----- ' + taskType + ' -----'));

              tasks.forEach(function(d){
                  total+=parseFloat(d.time);
                  console.log(d.time, d.note);
              });

          });

          console.log(chalk.cyan.bold('== ', total));
          console.log('');
          grandTotal += total;
      });

      console.log('');
      console.log(chalk.green.bold('Total Hours: ', grandTotal));
      cb();
  });
}

