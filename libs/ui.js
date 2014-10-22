var colors = require('colors');
var inquirer = require("inquirer");
var readline = require('readline');
var debug = require('debug')('Node.im:UI');
var NodeIM = require('../node.im');
var indent = '  ';

module.exports = new UI();

function UI() {
  this.rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    completer: completer
  });
  this.rl.on('close', function() {
    debug('Bye');
    return process.exit(0);
  });
}

UI.prototype.alert = alert;
UI.prototype.signup = signup;
UI.prototype.initMessager = initMessager;

function signup(callback) {
  if (!this.rl) return;
  var self = this;

  console.log();
  console.log(indent + colors.green('注册新用户 - Node.im'));
  console.log();

  this.rl.question(indent + "Email: ", function(email) {
    debug('注册新用户 Email: %s', email);
    NodeIM.signup({
      email: email
    }, callback);
  });
}

function initMessager(profile) {
  console.log()
  console.log(indent + 'Node.im'.green + ' 欢迎回来 %s', profile.username);
  console.log()

  NodeIM.messenger.on('message', function(data) {
    debug(data);

    new NodeIM.database.Query(NodeIM.database.User)
      .equalTo('objectId', data.fromPeerId)
      .find({
        success: function(results) {
          var target = results[0];
          console.log()
          console.log(indent + target.get('email').grey + ' %s 说: '.grey, parseDate(data.timestamp));
          console.log(indent + indent + data.msg);
        },
        error: function(error) {
          console.log(indent + data.msg);
        }
      })
  });

  NodeIM.messenger.IM.watch('').then(function(){
    debug('Watch %s Success', profile.objectId);
  });

  this.rl.on('line', function (str) {
    NodeIM.messenger.send('', str);
  });
}

function completer() {
  var completions = '.help .error .exit .quit .q'.split(' ')
  var hits = completions.filter(function(c) { return c.indexOf(line) == 0 })
  // show all completions if none found
  return [hits.length ? hits : completions, line]
}

function alert() {

}

function parseDate(timestamp) {
  var time = new Date(timestamp);
  return [
    time.getHours(),
    time.getMinutes()
  ].join(':');
}
