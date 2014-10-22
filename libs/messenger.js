var debug = require('debug')('Node.im:Messager');
var AVChatClient = require('lean-cloud-chat');
var utils = require('./utils');

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
Messenger.prototype.on = eventListener;
Messenger.prototype.quit = quitMessager;
Messenger.prototype.exit = quitMessager;

function sendMessage(peerId, message, callback) {
  if (!this.IM)
    return;
  if (!peerId || !message)
    return;

  this.IM
    .send(message, peerId)
    .then(
      function(){
        debug('Message Send Successful ID: %s', peerId);
        if (utils.isFunction(callback))
          return callback(null);
      },
      function(){
        debug('Message Send Fail ID: %s', peerId);
        if (utils.isFunction(callback))
          return callback(new Error('Node.im.Send(); Message send fail'))
      }
    );
}

function eventListener(eventName, callback) {
  if (!this.IM) return;
  return this.IM.on(eventName, callback);
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
  this.connectService(callback);

  return this;
}

function connectService(callback) {
  if (!this.IM)
    return;

  this.IM
    .open()
    .then(
      function() {
        debug('Connect Successful');
        // Connect Successful
        if (utils.isFunction(callback))
          return callback(null, this.IM);
      },
      function(){
        debug('Connect Fail');
        // Connect fail
        if (utils.isFunction(callback))
          return callback(new Error('Node.im.connectService(); Connect fail'));
      }
    );
}

function quitMessager(callback) {
  if (!this.IM)
    return;

  // Byebye
  this.IM.close().then(function(){
    debug('Byebye, Good night');
    if (utils.isFunction(callback))
      return callback();
  });
}
