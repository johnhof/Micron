'use strict';

let zeromatter = require('zeromatter');

let log = require('../../../lib/log').init('zmq');
let middleware = require('../../../lib/middleware');
let validator = require('./middleware/validator');
let contextBuilder = require('./middleware/context_builder');

const PROGRAM = require('../../../lib/commander');
const CONFIG = require('config');

let app = zeromatter(CONFIG.resources.zeromq);

// Bind response logic
app.use(middleware.responseBinder());

// Fallback error handler
app.use(middleware.errorHandler());

// Validate incoming request
app.use(validator());

// contect builder
app.use(contextBuilder());

// Logger
app.use(middleware.logger());

// app.use(middleware.contextBuilder());

app.listen();
log.info(`ZMQ service listening to: ${CONFIG.local.port}`);
