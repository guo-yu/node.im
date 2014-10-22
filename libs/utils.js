var fs = require('fsplus');
var path = require('path');
var debug = require('debug')('Node.im:Utils');
var profilePath = path.join(userHome(), '.nodeimrc');

exports.userHome = userHome;
exports.loadProfile = loadProfile;
exports.createProfile = createProfile;
exports.createRandomPassword = createRandomPassword;

function userHome() {
  return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}

function loadProfile() {
  debug('Loading Profile from %s', profilePath);

  if (!fs.existsSync(profilePath))
    return null;

  try {
    return fs.readJSON(profilePath);
  } catch (err) {
    debug(err);
    return null;
  }
}

function createProfile(user) {
  try {
    fs.writeJSON(profilePath, user);
  } catch (err) {
    throw err;
  }
}

function createRandomPassword() {
  return (new Date()).getTime() + (Math.random() * 10);
}