'use strict';

let genit = require('genit');
let _ = require('lodash');
let log = require('../log');

module.exports = (opts) => (ctx, next) => {
  let method = ctx.method.toString();
  log.info(`<-- ${method} ${ctx.path}`);
  let logReturn = () => {
    let status = ctx.body && ctx.body.status ? ctx.body.status : ctx.status;
    log.info(`--> ${method} ${ctx.path} ${status}`);
  }
  return next().then(logReturn).catch(logReturn);
}
