'use strict';

let bunyan = require('bunyan');
let bformat = require('bunyan-format');

const PACKAGE = require('../package.json');

let logger = false;
let init (widget) => {
   logger = bunyan.createLogger({
    name: PACKAGE.name,
    // stream: formatOut,
    level: 'debug'
  });

  if (widget) logger = logger.child({ widget_type: widget });
  logger.init = init;
};

module.exports.init = init;
