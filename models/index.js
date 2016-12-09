'use strict';

const FS = require('fs')
const requireSafe = require('../lib/helpers');
const MODELS = FS.readdirSync(__dirname);

module.exports = {
  schemas: {},
  views: {},
  methods: {},
  get: (n) => {
    return {
      schema: module.exports.schemas[n],
      views: module.exports.views[n],
      methods: module.exports.methods[n],
    }
  }
};


for (let model of MODELS) {
  if (model.indexOf('.')) continue; // file, not directory
  module.exports.schemas[model] = requireSafe(`./${model}/schema.json`, {});
  module.exports.views[model] = requireSafe(`./${model}/views.json`), {};
  module.exports.methods[model] = requireSafe(`./${model}/methods`), {};
}
