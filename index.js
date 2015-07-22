/**
 * My time pulled from Harvest
 */

// FIXME - custom start/end doesn't work
//
var path        = require('path'),
    moment      = require('moment'),
    envFile     = path.normalize(__dirname + '/.env'),
    nconf       = require('nconf').argv().file(envFile),
    subdomain   = nconf.get('SUBDOMAIN'),
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
    startOfWeek = 1, // Monday
    taskCodes   = {},
    _           = require('lodash');

taskCodes[meetingCode] = 'Meetings';
taskCodes[ticketCode] = 'Tickets';

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


Reports.timeEntriesByProject({
  project_id: projectId,
  from: start,
  to: end
}, function(err, tasks) {
    if (err) throw new Error(err);

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
        console.log(date, moment(date).format('ddd'));
        var sorted = _.sortBy(day, 'taskType');
        var grouped = _.groupBy(sorted, 'taskType');
        var total = 0;

        _.each(grouped, function(tasks, taskType){
            console.log('----- ' + taskType + ' -----');

            tasks.forEach(function(d){
                total+=parseFloat(d.time);
                console.log(d.time, d.note);
            });

        });

        console.log('== ', total);
        console.log('');
        grandTotal += total;
    });

    console.log('');
    console.log('Total Hours: ', grandTotal);
});

