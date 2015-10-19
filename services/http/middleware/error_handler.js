'use strict';

let _ = require('lodash');
let responseBinding = require('../../../lib/response_binding');

// Constants
const ERROR = {
  INTERNAL: {
    STATUS: 500,
    MESSAGE: 'Internal server error'
  },
  BAD_REQUEST: {
    STATUS: 400,
    MESSAGE: 'Bad Request'
  },
  NOT_FOUND: {
    STATUS: 404,
    MESSAGE: 'Not Found'
  }
};

// Bind middleware
module.exports = function (app) {

  app.use(function *(next) {
    let ctx = this;
    ctx = responseBinding(ctx);

    try {
      yield next;
    } catch (e) {
      console.error(e.stack);
      ctx.respond(ERROR.INTERNAL.STATUS, ERROR.INTERNAL.MESSAGE);
    }

    if (!this.body) {
      ctx.respond(ERROR.NOT_FOUND.STATUS, ERROR.NOT_FOUND.MESSAGE);
    }
  });
};
