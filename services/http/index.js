'use strict';

let koa = require('koa');
let clc = require('cli-color');
let program = require('commander');
let lusca = require('koa-lusca');
let _ = require('lodash');
let fleek = require('fleek-router');
let root = require('app-root-path');
let uuid =  require('uuid');
let parser = require('koa-bodyparser');
let waterline = require('../../lib/middleware/waterline');
let micron = require('micron-client');

let logger = require('./middleware/logger');
let errorHandler = require('./middleware/error_handler');

const config = require('config');
const models = config('models');

program
  .version(config.package.version)
  .description('REST authentication service')
  .option('-c, --log_color <color_code>', 'Set the color code for logging')
  .parse(process.argv);

let app = koa();

// Error Handler
errorHandler(app);

app.use(parser());

// Request Logging
logger(app);

// Application-Layer Security
app.use(lusca(config.lusca));

// Universal middleware
app.use(waterline);

// micron
app.use(micron.middleware.koa(config('services')));

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
app.listen(config.local.port);
console.log(clc.xterm(program.log_color)('REST service listening on port: ') + config.local.port);
