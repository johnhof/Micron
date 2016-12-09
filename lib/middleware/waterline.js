'use strict';

const _ = require('lodash');
const Waterline = require('koa-waterline');
const couchAdapter = require('sails-couchdb-orm');
const comise = require('comise');

const CONFIG = require('config');
const MODELS = require('../../models');

let injection = {
  methods: false,
  models: MODELS.schemas,
  connections: {},
  adapters: {
    couch: couchAdapter
  }
};

_.each(CONFIG.resources, (value, key) => {
  if (value && value.adapter) injection.connections[key] = value;
});

module.exports = (opts) => (ctx, next) => comise(function *() {
  ctx.waterline = yield Waterline.init(injection);
  yield next();
});
