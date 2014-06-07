var io = require('socket.io-client');
var evilscan = require('evilscan');
var consoler = require('consoler');
var localIP = require('my-local-ip')();
var utils = require('./utils');
var Server = require('./server');

module.exports = IM;

function IM(nickname, port) {
  this.nickname = nickname || 'Anonymous';
  this.port = port || 7654;
  this.clients = [];
  this.server = new Server(this.port);
}

IM.prototype.search = function(callback) {
  var self = this;
  this.scanner = new evilscan({
    target: utils.target(localIP),
    port: this.port, // default by 7654/7653
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
  var self = this;
  var socket = io.connect('http://' + client.ip + ':' + client.port);
  socket.on('message', function(user) {
    console.log(user.nickname + ': ' + user.message);
  });
  // open dialog window
  rl.setPrompt('', 0);
  rl.prompt();
  rl.on('line', function(line) {
    var text = line.trim();
    if (text === '') return false;
    if (text === 'exit' || text === 'q') return rl.close();
    socket.emit('message', {
      nickname: self.nickname,
      message: text
    });
    return rl.prompt();
  });
}

IM.prototype.serve = function() {
  if (!this.server) return false;
  var self = this;
  self.server.sockets.on('connection', function(socket) {
    // handshake
    socket.emit('message', {
      nickname: self.nickname,
      message: 'hi'
    });
    // reply message
    socket.on('message', function(user) {
      // auto-reply
      return socket.emit('message', {
        nickname: self.nickname,
        message: '你好，我现在不在，稍后再联系你啦'
      });
    });
  });
}

IM.prototype.boardcast = function() {
  if (!this.server) return false;
}

IM.prototype.fetch = function() {
  if (!this.server) return false;
}

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
}

IM.prototype.errors = function(err) {
  return consoler.error(err.toString());
}