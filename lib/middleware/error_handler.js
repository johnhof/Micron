'use strict';

let _ = require('lodash');
let yieldable = require('../helpers/yieldable');
let log = require('../log')

const RESPONSES = require('../../config/responses.json');

// Constants
const ERROR_CODE = {
  INTERNAL: 500,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
};

// Bind middleware
module.exports = (opts) => {
  return function *(next) {
    log.info('error handler: ', typeof next, next);
    try {
      yield next;
    } catch (e) {
      log.error(e.stack || e);
      this.respond(ERROR_CODE.INTERNAL, RESPONSES[ERROR_CODE.INTERNAL]);
    }

    if (!this.body) {
      this.respond(ERROR_CODE.NOT_FOUND, RESPONSES[ERROR_CODE.NOT_FOUND]);
    }
  };
};
