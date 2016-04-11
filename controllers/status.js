'use strict';

const CONFIG = require('config');

module.exports.get = function *() {
  let ctx = this;
  let response = {
    status: 'OK',
    version: CONFIG.package.version,
    resources: 'Not Shown',
    services: 'Not Shown'
  };

  // get the status of other micron services
  if (!ctx.request.query.shallow) {
    response.services = yield ctx.micron.status();
  }

  ctx.respond(response);
};
