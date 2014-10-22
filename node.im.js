var debug = require('debug')('Node.im');
var LeanCloud = require('avoscloud-sdk').AV;
var Messenger = require('./libs/messenger');
var utils = require('./libs/utils');
var configs = require('./configs');

module.exports = new NodeIM(configs);

function NodeIM(configs) {
  if (!configs.LeanCloud)
    throw new Error('NodeIM.initInstance(); Configs required');
  if (configs.LeanCloud && (!configs.LeanCloud.appId || !configs.LeanCloud.appKey))
    throw new Error('NodeIM.initInstance(); appId and appKey required');

  this.configs = configs;
  this.LeanCloud = LeanCloud.initialize(this.configs.appId, this.configs.appKey);
  this.profile = utils.loadProfile();
}

NodeIM.prototype.signup = Signup;
NodeIM.prototype.signin = Signin;

function Signup(newbie, callback) {
  var self = this;

  if (!this.LeanCloud)
    return;
  if (!newbie || (newbie && !newbie.email))
    return;

  var user = new this.LeanCloud.User();
  user.set("email", newbie.email);
  user.set("username", newbie.email);
  user.set("password", newbie.password || createRandomPassword());
  if (newbie.mobilePhoneNumber)
    user.setMobilePhoneNumber(newbie.mobilePhoneNumber);

  user.signUp(null, {
    success: function(user) {
      debug('Signup Successful !');
      debug(user);
      utils.createProfile(user);
      if (callback)
        return callback(null, user);
    },
    error: function(user, error) {
      debug('Error Code: %s', error.code);
      debug(error.message);
      if (callback)
        callback(error);
    }
  });
}

function Signin(callback) {
  var member = this.profile;
  this.LeanCloud
    .User
    .logIn(member.username, member.password, {
      success: function(user) {
        return callback(null, user);
      },
      error: function(user, error) {
        return callback(error, user);
      }
    });
}
