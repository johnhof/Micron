'use strict';

let clc = require('cli-color');
let program = require('commander');
let zmq = require('zmq');
let swaggerPaser = require('fleek-parser');
let _ = require('lodash');
let genit = require('genit');
let root = require('app-root-path');
let uuid = require('uuid');
let responseBinding = require('../../lib/response_binding');
let helpers = require('../../lib/helpers');
let co = require('co');
let path = require('path');

let templateTracer = helpers.templateTracer;
let toss = helpers.toss;

// set up middleware exec order
let middleware = [
  require('../../lib/middleware/waterline')
];

const config = require('config');
const swagger = swaggerPaser.parse('../config/swagger.json');

let traceTemplate = templateTracer(swagger.paths);

const CRUD_MAP = {
  post: 'create',
  get: 'read',
  put: 'update',
  delete: 'destroy'
};

program
  .version(config.package.version)
  .description('Messaging authentication service')
  .option('-c, --log_color <color_code>', 'Set the color code for logging')
  .parse(process.argv);


let responder = zmq.socket('rep');
responder.identity = 'subscriber:' + process.pid;
responder.connect('tcp://' + config.local.host + ':' + config.local.port);
let topicMap = {};

_.each(swagger.sanitizedRoutes, function (route) {
  let namespaces = [route.method + ' -- ' + route.path];

  let controller;
  try {
    controller = require(root + '/controllers/' + route.controller);
    if (!_.isObject(controller)) throw Error('Controller ' + route.controller + ' must be an object');
  } catch (e) {
    console.error('Could not load controller:' + root + '/controllers/' + route.controller);
    console.error(e);
    return;
  }

  let coreHandler = controller[route.method];
  if (CRUD_MAP[route.method]) {
    if (!genit.isGenerator(coreHandler)) {
      coreHandler = controller[CRUD_MAP[route.method]];
    }

    namespaces.push(CRUD_MAP[route.method] + ' -- ' + route.path);
  }

  if (!genit.isGenerator(coreHandler)) {
    console.error('Handler must be a generator : ' + route.method + ' ' + route.controller);
    return;
  }

  let handler = function *() {
    if (route.authRequired) {
      console.log('AUTHENTICATE');
      // let authenticated = yield auth;
      // if (!authenticated) return ctx.respond(401, 'Not Authenticated')
    }

    yield coreHandler.call(this);
  };

  _.each(namespaces, (topic) => {
    topicMap[topic] = handler;
  });
});

_.each(middleware, (func, index) => {
  if (!genit.isGenerator(func)) toss('Middleware [' + index + '] must be a generator');
});
let execFlow = function *(mWare, handler) {
  let ctx = this;
  if (mWare) {
    yield genit.each(mWare, function *(func, index) {
      yield func.call(ctx, function *() { /* NOOP - just here to fake koa middleware support */});
    });
  }

  yield handler.call(ctx);
};

responder.on('message', function (message) {
  let respond = function (msg, data) {
    if (msg.id) data.id = msg.id;
    data = JSON.stringify(data);
    console.log('  --> ' + (msg.method || 'unkown method').toUpperCase() + ' ' + (msg.path || 'unknown path'));
    responder.send(data);
  };

  try {
    message = JSON.parse(message.toString('utf8'));
  } catch (e) {
    console.error('Failed to parse message. JSON may be malformed');
    console.error(e.stack);
    return respond(message, {
      status: 400,
      success: false,
      data: 'Could not parse request. Make sure JSON is valid'
    });
  }

  message.path = message.path ? path.join('/', message.path) : message.path;
  console.log('  <-- ' + (message.method || 'unkown method').toUpperCase()  + ' ' + (message.path || 'unknown path'));

  co(function *() {
    let ctx = this;
    ctx.request = {};

    try {
      ctx.request.method = message.method;
      ctx.request.path = message.path;
      ctx.request.body = message.form || {};
      ctx.params = message.parameters;

      let template = traceTemplate(message.method, message.path.replace(swagger.basePath, ''));
      let handler = topicMap[message.method.toLowerCase() + ' -- ' + template];
      if (genit.isGenerator(handler)) {
        ctx = responseBinding(ctx);

        // middleware
        yield execFlow.call(ctx, middleware, handler);
      }

      if (!ctx.body) {
        ctx.respond(404);
      }

      respond(message, ctx.body);

    } catch (e) {
      respond(message, {
        status: 500,
        success: false,
        data: 'Internal server error'
      });
      console.error(e.stack);
    }

  }).catch(function (err) {
    console.error('Something has gone terribly wrong:', err.stack);
  });
});


console.log(clc.xterm(program.log_color)('Messaging services listening to: ') + config.local.host + ':' + config.local.port);
