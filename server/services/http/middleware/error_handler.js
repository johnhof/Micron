'use strict';

let _ = require('lodash');
let responseBinding = require('../../../../lib/response_binding');

const RESPONSES = require('../../config/responses.json')

// Constants
const ERROR_CODE = {
  INTERNAL: 500,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
};

// Bind middleware
module.exports = (opts) => {
  return function *(next) {
    try {
      yield next;
    } catch (e) {
      console.error(e.stack || e);
      this.respond(ERROR_CODE.INTERNAL, RESPONSES[ERROR_CODE.INTERNAL]);
    }

    if (!this.body) {
      this.respond(ERROR_CODE.NOT_FOUND, RESPONSES[ERROR.NOT_FOUND];
    }
  });
};
