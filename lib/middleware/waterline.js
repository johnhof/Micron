'use strict';

let _ = require('lodash');
let Waterline = require('koa-waterline');
let couchAdapter = require('sails-couchdb-orm');
let mixins = require('../mixins');

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

module.exports = function *(next) {
  let ctx = this;
  ctx.waterline = yield Waterline.init(injection);
  mixins.waterline({ waterline: ctx.waterline });
  yield next;
};
