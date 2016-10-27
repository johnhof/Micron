'use strict';

let zeromatter = require('zeromatter');
let swaggerParser = require('fleek-parser');
let responseBinding = require('../../lib/response_binding');
let helpers = require('../../lib/helpers');

let templateTracer = helpers.templateTracer;
let toss = helpers.toss;

const PROGRAM = require('../../lib/commander');
const _ = require('lodash');
const PATH = require('path');
const CONFIG = require('config');
const SWAGGER = swaggerParser.parse(__dirname + '/../../config/api.json');
const CRUD_MAP = {
  post: 'create',
  get: 'read',
  put: 'update',
  delete: 'destroy',
};


let traceTemplate = templateTracer(SWAGGER.paths);

let app = zeromatter();

// Fallback error handler
app.use(errorHandler());

// Validate incoming request
app.use(validator());

// Logger
app.use(logger());


app.listen();
