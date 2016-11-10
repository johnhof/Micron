'use strict';

const _ = require('lodash');

module.exports = (next) => {
  return _.isFunction(next) ? next() : next;
}
