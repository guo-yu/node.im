var consoler = require('consoler');
var readline = require('readline');
var sys = require('../package.json');
var IM = require('./im');

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on('close', function() {
  consoler.success('Bye ~');
  return process.exit(0);
});

module.exports = function() {
  var im = new IM(process.argv[2], process.argv[3]);
  return im.init(rl);
}