Just a simple Node.js Harvest client that goes out and queries Harvest's API for a timesheet for this current week and returns it formatted to my liking.

## Install

`npm install`

Then add a file in the project root called `.env`

```
{
  "SUBDOMAIN": "YOURSUBDOMAIN",
  "EMAIL": "YOUREMAIL",
  "PASSWORD": "YOUR PASSWORD",
  "PROJECT": PROJECTID
}
```

## Running

`node index`

It will look like this

```
2014-12-01
0.50 Scrum
0.75 blah, blah, blah
0.75 blah, blah, blah
1.75 blah, blah, blah
1.75 blah, blah, blah
2.75 blah, blah, blah
0.75 blah, blah, blah
==  9

2014-12-02
0.75 la, la, la
3.50 la, la, la
1.25 la, la, la
0.50 la, la, la
2.00 la, la, la
2.00 la, la, la
==  10
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
