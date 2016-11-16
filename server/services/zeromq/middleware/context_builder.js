'use strict';

module.exports = (opts) => (ctx, next) => {
  let data = ctx.data;
  ctx.method = data.method;
  ctx.path = data.path;
  ctx.status = 404;
  ctx.body = null;
  ctx.request = {};
  ctx.request.body = ctx.data.body || ctx.data.form || {};
  ctx.request.query = ctx.data.qs || {};
  ctx.params = ctx.data.parameters;
  return next();
};
