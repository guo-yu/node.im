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

IM.prototype.connect = function(client) {
    if (client.status !== 'open') throw new Error('抱歉，连接失败，请稍后再试');
    var socket = io.connect('http://' + client.ip + ':' + client.port);
    socket.on('hi', function(hi) {
        consoler.success('连接成功 => ' + client.ip);
        consoler.success('消息: ' + hi);
    });
    this.connector = socket;
};

IM.prototype.serve = function() {
    if (!this.server) return false;
    var self = this;
    self.server.sockets.on('connection', function(socket) {
        consoler.success('[server]: 已经建立链接');
        socket.emit('hi', '你好');
        socket.on('reply', function(reply) {
            consoler.success('> Reply: ' + reply);
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
    consoler.loading('正在搜索在线成员，请稍等...');
    self.search(function() {
        consoler.success(
            self.clients.length > 0 ?
            '搜索完成, 找到 ' + self.clients.length + ' 个在线成员' :
            '搜索完成, 你附近还没有人在线'
        );
        consoler.success('开始尝试建立链接 => ' + self.clients[0].ip);
        self.connect(self.clients[0]);
        self.serve();
    });
};

IM.prototype.errors = function(err) {
    return consoler.error(err.toString());
};

exports = module.exports = IM;