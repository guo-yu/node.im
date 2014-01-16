var consoler = require('consoler'),
    IM = require('./im'),
    im = new IM;

exports = module.exports = function() {
    var command = process.argv[2];
    if (!command) return im.init();
    consoler.success(command);
    return false;
};
