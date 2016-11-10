'use strict';

let zeromatter = require('zeromatter');

let log = require('../../../lib/log').init('zmq');
let middleware = require('../../../lib/middleware');
let validator = require('./middleware/validator');

const PROGRAM = require('../../../lib/commander');
const CONFIG = require('config');

let app = zeromatter(CONFIG.resources.zeromq);

app.use(function *(next) {
  log.info('test: ', typeof next, next);
  yield next()
})

// Fallback error handler
app.use(middleware.promisified.errorHandler());

// Validate incoming request
app.use(validator());

// Logger
app.use(middleware.logger());

// app.use(middleware.contextBuilder());

app.listen();
log.info(`ZMQ service listening to: ${CONFIG.local.port}`);
