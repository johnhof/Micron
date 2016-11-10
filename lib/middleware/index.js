'use strict';

const CASE = require('case');
const FS = require('fs');
const JS_EXT = /\.js$/;
const CO = require('co');

let yieldable = require('../helpers/yieldable');

let middleware = {};
middleware.promisified = {};

let files = FS.readdirSync(__dirname);
for (let i in files) {
  let file = files[i];
  if (file === 'index.js' || !JS_EXT.test(file)) continue;
  let name = file.replace(JS_EXT, '');
  let key = CASE.camel(name);
  middleware[key] = require(`./${name}`);

  middleware.promisified[key] = function promisify (opts) {
    let _middleware = middleware[key](opts);
    return function promisifyWrap (next) {
      console.log('WAT: ', typeof next, next);
      let ctx = this;
      return CO.wrap(function *() {
        console.log('WTF')
        let iterable = yield * (next.bind(ctx));
        console.log('HAH: ', typeof interable, iterable);
        return yield _middleware.call(ctx, iterable);
      })
    }
  }
}

module.exports = middleware;
