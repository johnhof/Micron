'use strict';

let koa = require('koa');
let clc = require('cli-color');
let lusca = require('koa-lusca');
let _ = require('lodash');
let fleek = require('fleek-router');
let root = require('app-root-path');
let uuid =  require('uuid');
let parser = require('koa-bodyparser');
let micron = require('micron-client');

let waterline = require('../../../lib/middleware/waterline');
let logger = require('./middleware/logger');
let errorHandler = require('./middleware/error_handler');

let statusCtrl = require('../../../controllers/status');

const PROGRAM = require('../../../lib/commander');
const CONFIG = require('config');

let app = koa();

// Error Handler
errorHandler(app);

app.use(parser());

// Request Logging
logger(app);

// Application-Layer Security
app.use(lusca(CONFIG.lusca));

// Universal middleware
app.use(waterline);

// micron
app.use(micron.middleware.koa(CONFIG.services));

app.use(function *(next) {
  if (this.path === '/status') {
    yield statusCtrl.get.call(this);
  } else {
    yield next;
  }
});

fleek(app, {
  controllers: root + '/controllers',
  documentation: true,
  validate: {
    catch: function *(err) {
      this.respond(400, err);
    }
  }
});

// Run Server
app.listen(CONFIG.local.port);
console.log(clc.xterm(PROGRAM['log-color'])('REST service listening on port: ') + CONFIG.local.port);
