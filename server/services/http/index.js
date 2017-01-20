'use strict';

let Koa = require('koa');

let convert = require('koa-convert');
let micron = require('micron-client');
let parser = require('koa-bodyparser');

let log = require('../../../lib/log').init('http');
let middleware = require('../../../lib/middleware');

let fleek = require('fleek');

const PROGRAM = require('../../../lib/commander');

let app = new Koa();

// Parser
app.use(convert(parser()));

// Request Logging
app.use(middleware.logger());

// Request Logging
app.use(middleware.responseBinder());

// Error handling
app.use(middleware.errorHandler());

// micron
// app.use(micron.middleware.koa(process.env..services));
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
app.listen(process.env.MICRON_SERVICE_HTTP_PORT);
log.info(`REST service listening on port: ${process.env.MICRON_SERVICE_HTTP_PORT}`);
