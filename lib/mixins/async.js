'use strict';

let _ = require('lodash');
let async = require('async');
let co = require('co');

module.exports = function (config) {
  let mixins = {};

  mixins._parallel  = function *(set) {
    return yield function (cb) {
      async.parallel(set, function (err, result) { return cb(null, result); });
    };
  };

  mixins.parallelEach = function *(set, operation) {
    if (!(set && !(!set.length && !Object.keys(set)))) { return false; }

    let success = true;
    let saveSet = _.map(set, function (val, key) {
      return function (callback) {
        co(function *() {
          let result = yield operation(val, key);
          success = success && result;
          callback();
        }).catch(function (e) {
          console.log(e.stack);
          callback();
        });
      };
    });

    return yield async._parallel(saveSet);
  };

  _.extend(async, mixins);
};
