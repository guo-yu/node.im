var io = require('socket.io-client'),
    evilscan = require('evilscan'),
    consoler = require('consoler'),
    localIP = require('my-local-ip')(),
    utils = require('./utils'),
    Server = require('./server');

var IM = function(nickname) {
    this.nickname = nickname || '匿名';
    this.port = 7654;
    this.clients = [];
    this.server = new Server(this.port);
};

IM.prototype.search = function(callback) {
    var self = this;
    this.scanner = new evilscan({
        target: utils.target(localIP),
        port: this.port,
        status: 'O', // Timeout, Refused, Open, Unreachable
        banner: true
    }, function() {}); // add a blank callback cause evilscan's bug

    this.scanner.on('result', function(client) {
        self.clients.push(client);
    });

    this.scanner.on('error', this.errors);
    this.scanner.on('done', callback);
    this.scanner.run();
}

IM.prototype.connect = function(client, callback) {
    if (client.status !== 'open') return callback(new Error('抱歉，连接失败'));
    var socket = io.connect('http://' + client.ip + ':' + client.port);
    socket.on('connect', function() {
        socket.on('event', function(data) {
            // console.log(data);
        });
        socket.on('disconnect', function() {
            console.log('disconnected!!!!');
        });
    });
    this.connector = socket;
};

IM.prototype.send = function(msg) {
    if (!this.server) return false;
    if (!msg) return false;
    var self = this;
    self.server.sockets.on('connection', function(socket) {
        socket.emit('message', msg);
        socket.on('reply', function(reply) {
            console.log(reply);
        });
    });
};

IM.prototype.boardcast = function() {
    if (!this.server) return false;
};

IM.prototype.fetch = function() {
    if (!this.server) return false;
};

IM.prototype.init = function(callback) {
    var self = this;
    if (!self.server) return false;
    self.search(function() {
        consoler.success(
            self.clients.length > 0 ?
            '搜索完成, 找到 ' + self.clients.length + ' 个在线成员' :
            '搜索完成, 你附近还没有人在线'
        );
        consoler.success('开始尝试建立链接');
        console.log(self.clients[0]);
        self.connect(self.clients[0]);
    });
};

IM.prototype.errors = function(err) {
    return consoler.error(err.toString());
};

exports = module.exports = IM;