'use strict';

let program = require('commander');
let _ = require('lodash');
let clc = require('cli-color');

const PACKAGE = require('../package.json');

// Separating this text allow micron updates without conflict
const DESCRIPTION = PACKAGE.name + '\n\t' + PACKAGE.description;
const MICRON_VERSION = '1.9.1';
const POWERED_BY = '\n\n\t' + clc.green.bold('µ') + ' v' + MICRON_VERSION;

program
  .version(PACKAGE.version)
  .description(DESCRIPTION + POWERED_BY)
  .option('-p, --port [port]', 'Port to bind to')
  .option('-n, --no_color', 'Do not use color when logging')
  .option('-e, --env [environment]', 'Exectution environment', /^(dev|development|prod|production)$/i)
  .option('-s, --syslog', 'log to syslog [TODO]')
  .option('-C, --config [config directory]', 'specify the config directory. missing config files will default to those in ./coinfig')
  .option('-c, --log_color [xterm color]', 'set the color code for logging')
  .option('-P, --preserve_disk', 'Do not log to file')
  .parse(process.argv);

program.appendParams = function (set) {
  _.each(program.options, (opt) => {
    let key = opt.long.replace('--', '');
    if (program[key] && key !== 'version') {
      set.push(opt.long);
      set.push(program[key]);
    }
  });

  return set;
};

module.exports = program;
