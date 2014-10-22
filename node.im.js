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
  this.profile = utils.loadProfile();

  LeanCloud.initialize(
    this.configs.LeanCloud.appId, 
    this.configs.LeanCloud.appKey
  );

  this.database = LeanCloud;
  this.messenger = new Messenger(this.profile.objectId);
  this.messenger.config('appId', this.configs.LeanCloud.appId);
  this.messenger.init();
}

NodeIM.prototype.signup = Signup;
NodeIM.prototype.signin = Signin;

function Signup(newbie, callback) {
  var self = this;

  if (!newbie || (newbie && !newbie.email))
    return;

  newbie.email = newbie.email.toLowerCase();

  var user = new LeanCloud.User();
  var password = newbie.password || utils.createRandomPassword();

  user.set("email", newbie.email);
  user.set("username", newbie.email);
  user.set("password", password);
  if (newbie.mobilePhoneNumber)
    user.setMobilePhoneNumber(newbie.mobilePhoneNumber);

  // Signup new user
  user.signUp(null, {
    success: function(member) {
      debug('Signup Successful !');
      // Save to profile
      utils.createProfile(member, password);

      if (callback)
        return callback(null, member);
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

  LeanCloud
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
