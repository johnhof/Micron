'use strict';

let request = require('request-promise');
let moment = require('moment');
let URL = require('url');

const PACKAGE = require('../package.json');

const VAR = process.env;
const STATUS_TIMEOUT = 10000;


module.exports.get = (ctx, next) => {
  let now = moment();
  let response = {
    status: 'OK',
    version: PACKAGE.version,
    external: [],
    resources: [],
    services: [],
    time: {
      full: now.toISOString(),
      date: now.format('MM/DD/YYYY'),
      time: now.format('hh:mm:ss:ms A'),
      offset: now.utcOffset(),
    }
  };


  if (ctx.request.query.shallow) return next();

  return parallelize([
    //
    // External
    //
    probe.all().then((r) => response.external = r),

    //
    // Resources
    //
    probe.all([
      {
        name: 'couchdb',
        host: VAR.MICRON_COUCHDB_HOST,
        port: VAR.MICRON_COUCHDB_PORT
      }
    ]).then((r) => response.resources = r),

    //
    // Services
    //
    probe.all().then((r) => response.services = r),

    //
    // Complete
    //
  ], STATUS_TIMEOUT)
    .then(() => ctx.respond(response))
    .catch((e) => {
      console.log(e.toString());
      response.status = 'ERROR';
        ctx.respond(e.status || 500, response)
    });
};

//
// Helpers
//

//
// Probe
let probe = (config) => {
  config.protocol = config.protocol || 'http';
  return request.get(URL.format(config)).then((r) => ({
    name: config.name,
    alive: (r.status >= 200 && r.status < 300)
  }));
};

//
// Probe All
probe.all = (configs=[]) => {
  let promises = [];
  for (let config of configs) promises.push(probe(config));
  return parallelize(promises);
};

//
// Parallelize
let parallelize = (promises=[], timeout) => {
  return new Promise((resolve, reject) => {
    let count = promises.length;
    let results = [];
    if (!count) resolve([]);

    for (let p of promises) {
      p.then((r) => {
        results.push(r);
        if (results.length === count) resolve(results);
      }).catch(reject);
    }

    if (timeout) setTimeout((() => {
      let e = Error('STATUS GATEWAY TIMEOUT');
      e.status = 504;
      reject(e)
    }), timeout);
  });
}
