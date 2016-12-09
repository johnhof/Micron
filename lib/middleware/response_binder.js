'use strict';

const _ = require('lodash');

module.exports = (opts) => (ctx, next) => {
  ctx.respond = (_status, _data) => {
    let success = false;
    ctx.body = {};
    ctx.status = !_.isNumber(_status) ? 200 : _status;
    ctx.body = {
      success: (ctx.status >= 200 && ctx.status < 300),
      status: ctx.status,
      data: _data || _status || responses[ctx.body.status]
    };
    ctx.body.message = ctx.body.success ?  'Operation successful' : 'Operation failed';
    return ctx.body;
  };

  return next();
}
