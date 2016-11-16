'use strict';
;
let Koa = require('koa');
let convert = require('koa-convert');
let clc = require('cli-color');
let lusca = require('koa-lusca');
let _ = require('lodash');
let fleek = require('fleek-router');
let root = require('app-root-path');
let uuid =  require('uuid');
let parser = require('koa-bodyparser');
let micron = require('micron-client');

let log = require('../../../lib/log').init('http');
let middleware = require('../../../lib/middleware');

const PROGRAM = require('../../../lib/commander');
const CONFIG = require('config');

let app = new Koa();

// Parser
app.use(convert(parser()));

// Request Logging
app.use(middleware.logger());

// Request Logging
app.use(middleware.responseBinder());

// Error handling
app.use(middleware.errorHandler());

// Application-Layer Security
app.use(convert(lusca(CONFIG.lusca)));

// Universal middleware
app.use(middleware.waterline());

// micron
// app.use(micron.middleware.koa(CONFIG.services));

// fleek(app, {
//   controllers: root + '/controllers',
//   documentation: true,
//   validate: {
//     catch: function *(err) {
//       this.respond(400, err);
//     }
//   }
// });

// Run Server
app.listen(CONFIG.local.port);
log.info(`REST service listening on port: ${CONFIG.local.port}`);
