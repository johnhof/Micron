'use strict';

let request = require('request-promise');
let _ = require('lodash');

let probe = function (config) {
  return comise(function *(){
    let host = config.host;
    let result;

    if (!host) return { error: 'Probe failed' };
    if (config.port) host = host + ':' + config.port;
    try {
      result = yield request.get('http://' + host);
    } catch (e) {
      if (!/parse\s+error/i.test(e.stack)) console.log(e.name + ': ' + e.message);
      let eIs = (str) => e.stack.indexOf(str) === -1;
      result = (eIs('ECONNREFUSED') && eIs('ENOTFOUND') && eIs('ETIMEDOUT'));
    }

    return {
      host: host,
      alive: !!result
    };
  });
};

probe.all = (set) => {
  return Promise.all(_.map(set, (config, name) => {
    return comise(function *(){
      let probeResult = yield probe(config);
      return {
        name: name,
        alive: probeResult.alive
      };
    });
  }));
}


module.exports.get = () => {
  let ctx = this;
  let response = {
    status: 'OK',
    version: CONFIG.package.version,
    resources: [],
    services: []
  };

  // get the status of other micron services
  if (!ctx.request.query.shallow) {
    let services = ctx.micron.status();
    response.services = _.map(services, (content, name) => {
      return {
        name: name,
        alive: !!(content && content.status)
      }
    });
  }

  response.resources = probe.all(CONFIG.resources);

  ctx.respond(response);
};
