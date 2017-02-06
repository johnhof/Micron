'use strict';

let Koa = require('koa');

let convert = require('koa-convert');
let micron = require('micron-client');
let parser = require('koa-bodyparser');
let swagger = require('swagger-injector');

let log = require('../../../lib/log').init('http');
let middleware = require('../../../lib/middleware');

let fleek = require('fleek');

const PACKAGE = require('../../../package.json');
const PROGRAM = require('../../../lib/commander');
const SWAGGER = fleek.parser.parse(`${__dirname}/../../../config/api.json`);

let app = new Koa();

// Parser
app.use(convert(parser()));

// Request Logging
app.use(middleware.logger());

// Response binding
app.use(middleware.responseBinder());

// Error handling
app.use(middleware.errorHandler());

app.use(swagger.koa({
  swagger: SWAGGER,
  prefix: SWAGGER.basePath,
  authentication: {
    sources: ['query'],
    key: 'foo',
    value: 'bar'
  },
  unauthorized: (ctx, next) => {
    ctx.status = 401
    ctx.body = {
      code: 200,
      meta: {
        version: PACKAGE.version
      },
      error: {
        description: 'Not authorized'
      }
    }
    return Promise.resolve();
  }
}))

// micron
// app.use(micron.middleware.koa(process.env..services));

// fleek context
app.use(fleek.context(SWAGGER));

app.use(fleek.validator().catch((ctx) => {
  ctx.respond(400, {
    message: 'Validation failed',
    errors: ctx.fleek.validation.errors
  });
  return Promise.resolve();
}));

app.use(fleek.router.controllers(`${__dirname}/../../../controllers`));

// Run Server
app.listen(process.env.MICRON_SERVICE_HTTP_PORT);
log.info(`REST service listening on port: ${process.env.MICRON_SERVICE_HTTP_PORT}`);
