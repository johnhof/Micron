'use strict';

const CASE = require('case');
const FS = require('fs');
const JS_EXT = /\.js$/;
const CO = require('co');

let middleware = {};
let files = FS.readdirSync(__dirname);
for (let i in files) {
  let file = files[i];
  if (file === 'index.js' || !JS_EXT.test(file)) continue;
  let name = file.replace(JS_EXT, '');
  let key = CASE.camel(name);
  middleware[key] = require(`./${name}`);
}

module.exports = middleware;
