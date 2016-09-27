'use strict';

let clc = require('cli-color');
let zmq = require('zmq');
let swaggerParser = require('fleek-parser');
let _ = require('lodash');
let genit = require('genit');
let root = require('app-root-path');
let uuid = require('uuid');
let co = require('co');
let path = require('path');
let micron = require('micron-client');
let responseBinding = require('../../../lib/response_binding');
let helpers = require('../../../lib/helpers');

let templateTracer = helpers.templateTracer;
let toss = helpers.toss;

const PROGRAM = require('../../../lib/commander');
const CONFIG = require('config');
const SWAGGER = swaggerParser.parse(__dirname + '/../../../config/api.json');

// Set up middleware exec order
let middleware = [
  require('../../../lib/middleware/waterline'),
  micron.middleware.koa(CONFIG('services')),
];

let traceTemplate = templateTracer(SWAGGER.paths);

const CRUD_MAP = {
  post: 'create',
  get: 'read',
  put: 'update',
  delete: 'destroy',
};

let responder = zmq.socket('rep');
responder.identity = 'subscriber:' + process.pid;
responder.connect('tcp://' + CONFIG.resources.zeromq.host + ':' + CONFIG.resources.zeromq.port);
let topicMap = {};

_.each(SWAGGER.sanitizedRoutes, function(route) {
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

    /* Adding in execution path to config */
    if (route.details && _.isString(route.details.operationId)) {
      let operationId = route.details.operationId;
      let operationIdCtrl = controller[operationId];
      if (!genit.isGenerator(operationIdCtrl)) {
        console.error(`\nInvalid controller. The operationId *${operationId}* in *${route.controller}* controller is not a generator\n`);
        console.log(`Fallback to default ${route.method.toUpperCase()} handler\n`);
        coreHandler = controller[route.method];
      } else {
        coreHandler = controller[operationId];
      }
    } else { // Default to POST, GET, PUT, DELETE if no operationId specify
      coreHandler = controller[route.method];
    }


    if (!genit.isGenerator(coreHandler)) {
      console.error('Handler must be a generator : ' + route.method + ' ' + route.controller);
      return;
    }

  let handler = function *() {
    if (route.authRequired) {
      console.log('AUTHENTICATE');
      // Let authenticated = yield auth;
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

responder.on('message', function(message) {
  let ctx = responseBinding({});
  let respond = function(data) {
    console.log(data);
    if (data.status) {
      ctx.body = data;
    } else {
      ctx.respond(data);
    }

    console.log(ctx.body);
    ctx.body.id = ctx.id;
    data = JSON.stringify(ctx.body);
    console.log('  --> ' + (message.method || 'unkown method').toUpperCase() + ' ' + (message.path || 'unknown path'));
    responder.send(data);
  };


  try {
    message = JSON.parse(message.toString('utf8'));
    ctx.id = message.id;
  } catch (e) {
    console.error('Failed to parse message. JSON may be malformed');
    console.error(e.stack);
    return respond({
      status: 400,
      data: 'Could not parse request. Make sure JSON is valid',
    });
  }

  message.path = message.path ? path.join('/', message.path) : message.path;
  console.log('  <-- ' + (message.method || 'unkown method').toUpperCase()  + ' ' + (message.path || 'unknown path'));

  co(function *() {
    let ctx = {};
    ctx.request = {};

    try {
      ctx.request.method = message.method;
      ctx.request.path = message.path;
      ctx.request.query = message.query || message.qs || {};
      ctx.request.body = message.body || message.form || {};
      ctx.params = message.parameters;

      let template = traceTemplate(message.method, message.path.replace(SWAGGER.basePath, ''));
      let handler = topicMap[message.method.toLowerCase() + ' -- ' + template];
      if (genit.isGenerator(handler)) {
        ctx = responseBinding(ctx);

        // Middleware
        yield execFlow.call(ctx, middleware, handler);
      }

      respond(ctx.body || 404);

    } catch (e) {
      respond(500);
      console.error(e.stack);
    }

  }).catch(function(err) {
    console.error('Something has gone terribly wrong:', err.stack);
  });
});


console.log(clc.xterm(PROGRAM['log-color'])('Messaging services listening to: ') + CONFIG.resources.zeromq.host + ':' + CONFIG.resources.zeromq.port);
