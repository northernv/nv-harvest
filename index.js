var path        = require('path'),
    moment      = require('moment'),
    envFile     = path.normalize(__dirname + '/.env'),
    nconf       = require('nconf').argv().file(envFile),
    subdomain   = nconf.get('SUBDOMAIN'),
    email       = nconf.get('EMAIL'),
    password    = nconf.get('PASSWORD'),
    projectId   = nconf.get('PROJECT'),
    dateFormat  = 'YYYYMMDD',
    Harvest     = require('harvest'),
    harvest     = Harvest({subdomain: subdomain, email: email, password: password}),
    Reports     = harvest.Reports,
    startOfWeek = 1; // Monday

// Changed start of week to monday
moment.locale('us', {
  week: {
    dow: startOfWeek
  }
});


var start = moment().startOf('week'),
    end   = moment(start).add(6, 'd');

Reports.timeEntriesByProject({
  project_id: projectId,
  from: start.format(dateFormat),
  to: end.format(dateFormat)
}, function(err, tasks) {
    if (err) throw new Error(err);

    var times = {};

    // Process times
    tasks.forEach(function(task) {
      var entry = task.day_entry;
      var day = entry.spent_at;
      var num = entry.hours;
      var up = (Math.ceil(num * 4) / 4).toFixed(2);

      // Init array if doesn't exists
      if (!Array.isArray(times[day])) times[day] = [];

      times[day].push({time: up, note: entry.notes} );
    });

    var grandTotal = 0;

    // Print out
    for (var t in times) {

      console.log(t);

      var total = 0;

      times[t].forEach(processDay);

      console.log('== ', total);
      console.log('');
      grandTotal += total;
    }

    console.log('');
    console.log('Total Hours: ', grandTotal);

    function processDay(day) {
      total+=parseFloat(day.time);
      console.log(day.time, day.note);
    }
});

