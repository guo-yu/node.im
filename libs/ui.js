var readline = require('readline');
var colors = require('colors');
var debug = require('debug')('Node.im:UI');

module.exports = new UI();

function UI() {
  this.rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

UI.prototype.signup = signup;
UI.prototype.initMessager = initMessager;

function signup() {

}

function initMessager() {
  
}