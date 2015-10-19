'use strict';

let _ = require('lodash');

const config = require('config');
const responses = config('responses');

module.exports =  function (ctx) {
  ctx.respond = function (status, data) {
    let success = false;

    if (_.isNumber(status)) {
      ctx.status = status;
    } else {
      ctx.status = 200;
      data = status;
    }


    ctx.body = {
      status: ctx.status,
      success: (ctx.status >= 200 && ctx.status < 300),
      data: data
    };

    if (!data) ctx.body.data = responses[ctx.body.status];

    return ctx.body;
  };

  return ctx;
};
