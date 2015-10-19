'use strict';

let _ = require('lodash');
let cfg = require('config');
let bcrypt = require('bcrypt');

module.exports = function (config) {
  let mixins = {};

  mixins.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
  };

  mixins.toPassword = function *() {
    return this;
    // let password = yield bcrypt.hash(this, cfg.salt);
    return password;
  };


  mixins.toEmail = function () {
    let email = this.trim().toLowerCase();
    return email;
  };

  mixins.toCamelCase = function () {
    let nameSplit = this.split('_');
    _.each(nameSplit, function (work, index) { if (index > 0) nameSplit[index] = work.capitalize(); });

    return nameSplit.join('');
  };

  mixins.is = function (compare) {
    return (this === compare);
  };

  mixins.contains = function (substring) {
    return (~this.indexOf(substring));
  };

  _.extend(String.prototype, mixins);
};
