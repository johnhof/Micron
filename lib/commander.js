'use strict';

let program = require('commander');

const ROOT = require('app-root-path');
const PACKAGE = require(ROOT + '/package.json');

program
  .version(PACKAGE.version)
  .description('Micron')
  .option('-s, --syslog', 'log to syslog')
  .option('-C, --config [config directory]', 'specify the config directory')
  .option('-c, --log-color [xterm color]', 'set the color code for logging')
  .parse(process.argv);

module.exports = program;
