'use strict';

let _ = require('lodash');
let fs = require('fs');

let mixins = {};
let names = [];
_.each(fs.readdirSync(__dirname), function (file) {
  if (file !== 'index.js') {
    let name = file.replace(/\.js$/, '');
    mixins[name] = require('./' + file);
    names.push(name);
  }
});

mixins.all = function (config) {
  _.each(names, (name) => { mixins[name](config); });
};

module.exports = mixins;
