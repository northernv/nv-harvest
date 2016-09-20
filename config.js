const path = require('path')
const nconf = require('nconf')
const configFileName = '.timesheet'
const HOME = process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME']
const userEnvFile = path.normalize(HOME + '/' + configFileName)

// Command line args take highest precedence
nconf.argv()

// Look for .timesheet in current directory and walk up the tree
// this allows for adding project specific .timesheet files..
nconf.file('project', {
  file: configFileName,
  search: true
})

// Fallback to global config in user's home folder.
nconf.file('user', userEnvFile)

module.exports = nconf
