var apiPathAccount = '/account';
var CC = require('./ConnectionConstants.js');

function Account(connection) {
  this.connection = connection;
}

Account.prototype.changePassword = function (oldPassword, newPassword, callback) {
  if (typeof(callback) !== 'function') {
    throw new Error(CC.Errors.CALLBACK_IS_NOT_A_FUNCTION);
  }
  this.connection.request({
    method: 'POST',
    path: apiPathAccount + '/change-password',
    jsonData: {'oldPassword': oldPassword, 'newPassword': newPassword},
    callback: function (err) {
      callback(err);
    }
  });
};
Account.prototype.getInfo = function (callback) {
  if (typeof(callback) !== 'function') {
    throw new Error(CC.Errors.CALLBACK_IS_NOT_A_FUNCTION);
  }
  this.connection.request({
    method: 'GET',
    path: apiPathAccount,
    callback: function (error, result) {
      if (result && result.account) {
        result = result.account;
      }
      callback(error, result);
    }
  });
};

module.exports = Account;