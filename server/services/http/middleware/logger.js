'use strict';

let logger = require('koa-logger');
let responseTime = require('koa-response-time');

module.exports = function (app) {
  app.use(logger());
  app.use(responseTime());
};
