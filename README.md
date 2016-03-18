Just a simple Node.js Harvest client that goes out and queries Harvest's API for a timesheet for this current week and returns it formatted to my liking.

## Install

`npm install -g git@github.com:northernv/nv-harvest.git`

Then add a file to your home directory `.timesheet`

```
{
  "SUBDOMAIN": "YOURSUBDOMAIN",
  "EMAIL": "YOUREMAIL",
  "PASSWORD": "YOUR PASSWORD",
  "PROJECT": PROJECTID
}
```

You can also add a `.timesheet` file to the root of each project to override settings for that project only.

## Running

`$ timesheet`

It will look like this

```
2016-03-17 Thu
----- Development ( 6.75 ) -----
2.75 ENG-6353 blah blah blah
3.00 ENG-6350 blah blah blah
1.00 ENG-6326 blah blah blah
----- Meeting ( 0.5 ) -----
0.50 Scrum
==  7.25

2016-03-18 Fri
----- Development ( 6.25 ) -----
3.25 ENG-6326 blah blah blah
3.00 ENG-6326 blah blah blah
----- Meeting ( 0.5 ) -----
0.50 Scrum
==  6.75


Total Hours:  41.25
```


## Notes

1. It goes from Mon - Sun, so change if you need to
2. It rounds the hours up to the next .25 hour
3. You can provide command line arguments to override the `.env` file

```
# Use a differnt project ID
node index --PROJECT=3333

# Use a different email password
node index --EMAIL="larryboy@veggies.com" --PASSWORD="123"
```
