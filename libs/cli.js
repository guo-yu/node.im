var consoler = require('consoler'),
    readline = require('readline'),
    sys = require('../package.json'),
    IM = require('./im');

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.on('close', function() {
    consoler.success('Bye ~');
    return process.exit(0);
});

exports = module.exports = function() {
    var im = new IM(process.argv[2],process.argv[3]);
    return im.init(rl);
};