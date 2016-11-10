'use strict';

let bunyan = require('bunyan');
let bformat = require('bunyan-format');

const CONFIG = require('config');
const PACKAGE = require('../../package.json');
const ENV = CONFIG.local.isDev ? 'development' : 'production';
const STREAM = require(`./streams/${ENV}`);

let logger = false;
let init = (widget) => {;
  logger = bunyan.createLogger({
    name: PACKAGE.name,
    level: 'debug',
    type: 'raw',
    stream: new STREAM()
  });
  
  if (widget) logger = logger.child({ widget_type: widget });
  logger.init = init;
  module.exports = logger;
  return logger;
};

module.exports = init();
