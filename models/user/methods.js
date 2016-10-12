'use strict';

let tfy = require('tfy');

module.exports = function (collections) {
  let User = collections.user;
  User.update = tfy(User.merge, User);
}
