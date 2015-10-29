'use strict';

module.exports.get = function *() {
  let ctx = this;
  let response = {
    status: 'OK',
    resources: 'Not Shown',
    services: 'Not Shown'
  };

  // get the status of other micron services
  if (!ctx.request.query.shallow) {
    ctx.services = yield ctx.micron.status();
  }

  ctx.respond(response);
};
