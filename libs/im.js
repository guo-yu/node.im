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

IM.prototype.connect = function(client, rl) {
    if (client.status !== 'open') return consoler.error('抱歉，连接失败，请稍后再试');
    var socket = io.connect('http://' + client.ip + ':' + client.port);
    socket.on('hi', function(user) {
        consoler.success('与' + user + '@' + client.ip + '对话: ');
        // open dialog window
        rl.setPrompt('> ');
        rl.prompt();
        rl.on('line', function(line) {
            var text = line.trim();
            if (text === '') return false;
            if (text === 'exit' || text === 'q') return rl.close();
            socket.emit('message', text);
            rl.prompt();
        });
    });
    this.connector = socket;
};

IM.prototype.serve = function() {
    if (!this.server) return false;
    var self = this;
    self.server.sockets.on('connection', function(socket) {
        socket.emit('hi', self.nickname);
        socket.on('message', function(msg) {
            return console.log(self.nickname + ' > 你好，我现在不在，但是已经收到你的消息了: ' + msg);
        });
    });
};

IM.prototype.boardcast = function() {
    if (!this.server) return false;
};

IM.prototype.fetch = function() {
    if (!this.server) return false;
};

IM.prototype.init = function(rl, callback) {
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
        self.connect(self.clients[0], rl);
        self.serve();
    });
    return this;
};

IM.prototype.errors = function(err) {
    return consoler.error(err.toString());
};

exports = module.exports = IM;