'use strict';

let zeromatter = require('zeromatter');

let validator = require('./middleware/validator');
let contextBuilder = require('./middleware/context_builder');

let log = require('../../../lib/log').init('zmq');
let middleware = require('../../../lib/middleware');

let fleek = require('fleek');

const PROGRAM = require('../../../lib/commander');

let app = zeromatter(process.env.MICRON_SERVICE_ZMQ_PORT);

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

// Fleek context
app.use(fleek.context(fleek.parser.parse(`${__dirname}/../../../config/api.json`)));

app.use(fleek.validator().catch((ctx) => {
  ctx.respond(400, {
    message: 'Validation failed',
    errors: ctx.fleek.validation.errors
  });
  return Promise.resolve();
}));

app.use(fleek.router.controllers(`${__dirname}/../../../controllers`));

// Run Server
app.listen(process.env.MICRON_SERVICE_ZMQ_PORT);
log.info(`ZMQ service listening to: ${process.env.MICRON_SERVICE_ZMQ_PORT}`);
