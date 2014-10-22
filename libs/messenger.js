var AVChatClient = require('lean-cloud-chat');
var configs = require('../configs');

module.exports = Messenger;

function Messenger(configs) {
  if (configs && typeof(configs) === 'object') {
    this.IM = new AVChatClient(configs);
    this.connectService();
  }
  if (configs && typeof(configs) === 'string') {
    this.configs = {
      peerId: configs // `ObjectId` of this user as `peerId` of Node.im
    };
  }
  return this;
}

Messenger.prototype.init = initMessager;
Messenger.prototype.send = sendMessage;
Messenger.prototype.config = configMessager;
Messenger.prototype.connectService = connectService;
Messenger.prototype.quit = quitMessager;
Messenger.prototype.exit = quitMessager;

function sendMessage(peerId, message, callback) {
  if (this.IM)
    return;
  if (!peerId || !message)
    return;

  this.IM
    .send(message, peerId)
    .then(
      function(){
        if (isFunction(callback))
          return callback(null);
      },
      function(){
        if (isFunction(callback))
          return callback(new Error('Node.im.Send(); Message send fail'))
      }
    );
}

function configMessager(key, value) {
  if (!this.configs)
    this.configs = {};
  var isObjectConfig = typeof(key) === 'object' && !value;
  var isKeyValueConfig = key && value && typeof(key) === 'string';

  if (isObjectConfig) {
    for (var k in key)
      this.configs[k] = key[k];
  }

  if (isKeyValueConfig)
    this.configs[key] = value;

  return this.configs;
}

function initMessager(callback) {
  if (this.IM)
    return;
  if (!this.configs)
    throw new Error('Node.im.Init(); Required configs missing.');
  if (this.configs && !this.configs.appId)
    throw new Error('Node.im.Init(); appId is required.');

  this.IM = new AVChatClient(this.configs);
  this.connectService();

  return this;
}

function connectService(callback) {
  if (!this.IM)
    return;

  this.IM
    .open()
    .then(
      function() {
        // Connect Successful
        if (isFunction(callback))
          return callback(null, this.IM);
      },
      function(){
        // Connect fail
        if (isFunction(callback))
          return callback(new Error('Node.im.connectService(); Connect fail'));
      }
    );
}

function quitMessager(callback) {
  if (!this.IM)
    return;

  // Byebye
  this.IM.close().then(function(){
    if (isFunction(callback))
      return callback();
  });
}

function isFunction(callback) {
  return callback && typeof(callback) === 'function';
}