var evilscan = require('evilscan'),
    consoler = require('consoler'),
    localIP = require('my-local-ip')(),
    utils = require('./utils'),
    Server = require('./server');

var IM = function() {
    this.port = 7654
    this.server = new Server(this.port);
};

IM.prototype.search = function() {
    var self = this;
    var scanner = new evilscan({
        target: utils.target(localIP),
        port: self.port,
        status: 'O', // Timeout, Refused, Open, Unreachable
        banner: true
    }, function() {}); // add a blank callback cause evilscan's bug

    self.clients = [];

    scanner.on('result', function(client) {
        self.clients.push(client);
    });

    scanner.on('error', function(err) {
        // throw new Error(data.toString());
    });

    scanner.on('done', function() {
        consoler.success('搜索完成');
        consoler.success(
            self.clients.length > 0 ? 
            '找到 ' + self.clients.length + ' 个在线成员' :
            '你附近还没有人在线'
        )
    });

    scanner.run();
}

IM.prototype.send = function() {
    if (!this.server) return false;
};

IM.prototype.boardcast = function() {
    if (!this.server) return false;
};

IM.prototype.fetch = function() {
    if (!this.server) return false;
};

exports = module.exports = IM;
