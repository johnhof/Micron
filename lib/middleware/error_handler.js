'use strict';

const _ = require('lodash');
const log = require('../log')

const RESPONSES = require('../../config/responses.json');

// Constants
const ERROR_CODE = {
  INTERNAL: 500,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
};

module.exports = (opts) => (ctx, next) => next().then(() => {
  if (!ctx.body) ctx.respond(ERROR_CODE.NOT_FOUND, RESPONSES[ERROR_CODE.NOT_FOUND]);
}).catch((e) => {
  log.error(e.stack || e);
  ctx.respond(ERROR_CODE.INTERNAL, RESPONSES[ERROR_CODE.INTERNAL]);
});
