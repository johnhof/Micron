'use strict';

let fs = require('fs');
let _ = require('lodash');

const CONFIG = require('config');

// version calculation
const BASE = CONFIG.swaggerDoc.basePath;
const BASE_SET = BASE.replace(/v|\//ig, '').split('.');
const VERSION_SET = CONFIG.package.version.split('.');
const VERSION = {
  major: VERSION_SET[0],
  minor: VERSION_SET[1],
  patch:VERSION_SET[2]
};

if (BASE_SET[0] !== VERSION.major || (BASE_SET[1] && BASE_SET[1] !== VERSION.minor)) {
  let pkg = `Package version [${CONFIG.package.version}]`;
  let prefix = `API prefix [${CONFIG.swaggerDoc.basePath}]`;
  console.log(`WARNING: ${pkg} and ${prefix} do not match`);
}

module.exports.get = function * () {
  let ctx = this;
  return yield ctx.respond(200, {
    version: CONFIG.package.version,
    prefix: CONFIG.swaggerDoc.basePath,
    semantic: VERSION
  });
};
