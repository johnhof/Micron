'use strict';

const response = require('../../config/response.json');

module.exports = (opts) => (ctx, next) => {
  ctx.status = 404;
  ctx.body = RESPONSE.schema;
  return next();
}
