'use strict';

let zeromatter = require('zeromatter');

let validator = require('./middleware/validator');
let contextBuilder = require('./middleware/context_builder');

let log = require('../../../lib/log').init('zmq');
let middleware = require('../../../lib/middleware');

let fleek = {
  context: require('fleek-context'),
  validator: require('fleek-validator')
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

app.use(fleek.validator().catch((ctx) => {
  ctx.respond(400, {
    message: 'Validation failed',
    errors: ctx.fleek.validation.errors
  });
  return Promise.resolve();
}));

app.use((ctx, next) => {
  if (ctx.fleek.context) ctx.respond('TEST');
  else ctx.respond(404, {});
  return next();
});

app.listen();
log.info(`ZMQ service listening to: ${CONFIG.local.port}`);
