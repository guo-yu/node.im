var io = require('socket.io');

exports = module.exports = function(port) {
    return io.listen(port && !isNaN(parseInt(port)) ? parseInt(port) : 8080, { log: false });
};
