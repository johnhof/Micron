'use strict';

let _ = require('lodash');
let router = require('koa-router')();

module.exports.toss = function (msg) {
  let error = Error(msg);
  throw error;
};

module.exports.templateTracer = function (routeSet) {
  // build out the router using the templates
  _.each(routeSet, function (methods, path) {
    _.each(methods, function (details, method) {
      router[method](path, function *() {});
    });
  });

  // use a map to avoid searching a giant list of paths+methods on every request
  let methodMap = {};
  // transcribe the route for tracing
  _.map(router.stack, function (route) {
    _.each(route.methods, function (method) {
      method = method.toLowerCase();
      methodMap[method] = methodMap[method] || [];
      methodMap[method].push({
        path   : route.path,
        regexp : route.regexp
      });
    });
  });

  // return a function to get the template
  return function (method, path) {
    let result;
    let methodPaths = methodMap[method.toLowerCase()];
    _.each(methodPaths, function (compiledTemplate) {
      if (compiledTemplate.regexp.test(path)) {
        result = compiledTemplate.path;
      }
    });

    return result;
  };
};
