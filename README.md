Just a simple Node.js Harvest client that goes out and queries Harvest's API for a timesheet for this current week and returns it formatted to my liking.

## Install

`npm install -g git@github.com:northernv/nv-harvest.git`

Then add a file to your home directory `.timesheet`

```
{
  "SUBDOMAIN": "YOURSUBDOMAIN",
  "EMAIL": "YOUREMAIL",
  "PASSWORD": "YOUR PASSWORD",
  "PROJECT": "PROJECTID",
  "JIRA_USERNAME": "JIRA_USERNAME",
  "JIRA_PASSWORD": "JIRA_PASSWORD",
  "JIRA_URL": "JIRA_URL"

}
```

You can also add a `.timesheet` file to the root of each project to override settings for that project only.

## Running

### Harvest Time Report

`$ timesheet`

It will look like this

```
2016-03-17 Thu
----- Development ( 6.75 ) -----
2.75 ABC-6353 blah blah blah
3.00 ABC-6350 blah blah blah
1.00 ABC-6326 blah blah blah
----- Meeting ( 0.5 ) -----
0.50 Scrum
==  7.25

2016-03-18 Fri
----- Development ( 6.25 ) -----
3.25 XYZ-6326 blah blah blah
3.00 XYZ-6326 blah blah blah
----- Meeting ( 0.5 ) -----
0.50 Scrum
==  6.75


Total Hours:  41.25
```

### Jira

`$ jiratime`

> Logs your time with Jira. Automatically _skips_ entries that have already been logged.

**Time entries MUST follow this format `ABC-1 Note of the ticket`**

**Output**
```
== Adding == 1.25 ABC-1663 blah blah blah
== Skipping == 1.25 XYZ-13953 blah blah blah
== Adding == 0.50 MNO-5276 blah blah blah
== Skipping == 1.25 ABC-1663 blah blah blah
== Adding == 0.75 XYZ-14016 blah blah blah
== Skipping == 2.75 ABC-1663 blah blah blah
```

## Options

All of these options can be entered on the command line or held in the `.timesheet` json file

### lastweek
> Fetches last weeks date range

```
$ timesheet --lastweek
```

### yesterday
> Fetches yesterday's date range

```
$ timesheet --yesterday
```

### START
> Defines the start date in the format YYYYMMDD.

```
$ timesheet --START=20160901
```

### END
> Defines the end date in the format YYYYMMDD.

```
$ timesheet --END=20161001
```

### startOfWeek (Monday)
> Defines the starting day of the week
```
$ timesheet --startOfWeek=0
```

### PROJECT
> Defines the Harvest project to query
```
$ timesheet --PROJECT=3333
```

## NOTES

1. It rounds the hours up to the next .25 hour
