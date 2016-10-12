'use strict';

const CONFIG = require('config');

// Prefix & Versioning
const EXPECT_PREFIX = CONFIG.swaggerDoc.basePath + '/';
const VERSION_MATCH = (EXPECT_PREFIX.match(/v(\d+)\.?(\d+)?\.?(\d+)?/i) || []);
const MAJOR_VERSION = VERSION_MATCH[1];
const MINOR_VERSION = VERSION_MATCH[2];
const PATCH_VERSION = VERSION_MATCH[3];
const ACCEPT_PREFIX = new RegExp(`^/v${MAJOR_VERSION}(/|$)`);

// Route/controller bypass
const ROUTE_MAP = {
  '/status': require('./../../../../controllers/status'),
  '/version': require('./../../../../controllers/version'),
};

module.exports.bypass = function (app, config) {
  app.use(function *(next) {
    let ctrl = ROUTE_MAP[this.path];
    let method = this.method.toLowerCase();
    if (ctrl && ctrl[method]) yield ctrl[method].call(this);
    else yield next;
  });
};

module.exports.normalize = function (app) {
  app.use(function * (next) {
    if (ACCEPT_PREFIX.test(this.path)) {
      this.path = this.path.replace(ACCEPT_PREFIX, EXPECT_PREFIX);
    }

    yield next;
  });
