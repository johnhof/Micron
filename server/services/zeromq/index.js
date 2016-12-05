'use strict';

let zeromatter = require('zeromatter');

let log = require('../../../lib/log').init('zmq');
let middleware = require('../../../lib/middleware');
let validator = require('./middleware/validator');
let contextBuilder = require('./middleware/context_builder');

let fleek = {
  context: require('fleek-context')
};
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

// Universal middleware
app.use(middleware.waterline());

// Fleek context
app.use(fleek.context(CONFIG.swagger));

app.use((ctx, next) => {
  ctx.respond('TEST');
  return next();
});

app.listen();
log.info(`ZMQ service listening to: ${CONFIG.local.port}`);
