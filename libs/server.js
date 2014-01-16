var io = require('socket.io');

exports = module.exports = function(port) {
    io.listen(port && !isNaN(parseInt(port)) ? parseInt(port) : 8080);
    return io;
};
