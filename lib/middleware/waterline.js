'use strict';

let _ = require('lodash');
let Waterline = require('koa-waterline');
let couchAdapter = require('sails-couchdb-orm');
let co = require('co');
let comise = require('comise');

const config = require('config');

let injection = {
  methods: false,
  models: _.clone(config.models),
  connections: {},
  adapters: {
    couch: couchAdapter
  }
};

_.each(config.resources, (value, key) => {
  if (value && value.adapter) injection.connections[key] = value;
});

module.exports = (opts) => (ctx, next) => comise(function *() {
  ctx.waterline = yield Waterline.init(injection);
  yield next();
});
