'use strict';

let genit = require('genit');
let _ = require('lodash');
let log = require('../log');
let yieldable = require('../helpers/yieldable');

module.exports = function (opts) {
  return function *(next) {
    let method = this.method.toString();
    log.info(`<-- ${method} ${this.path}`);
    yield next;
    log.info(`--> ${method} ${this.path} ${this.body.status}`);
  }
}
