'use strict';

let Koa = require('koa');

let convert = require('koa-convert');
let lusca = require('koa-lusca');
let parser = require('koa-bodyparser');
let micron = require('micron-client');

let log = require('../../../lib/log').init('http');
let middleware = require('../../../lib/middleware');

let fleek = {
  context: require('fleek-context'),
  validator: require('fleek-validator')
};

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

app.use(fleek.context(CONFIG.swagger));

app.use(fleek.validator().catch((ctx) => {
  ctx.respond(400, {
    message: 'Validation failed',
    errors: ctx.fleek.validation.errors
  });
  return Promise.resolve();
}));

app.use((ctx, next) => {
  ctx.respond('TEST');
  return next();
});

// Run Server
app.listen(CONFIG.local.port);
log.info(`REST service listening on port: ${CONFIG.local.port}`);
