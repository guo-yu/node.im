exports.userHome = userHome;

function userHome() {
  return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}