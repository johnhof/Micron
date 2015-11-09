'use strict';

let program = require('commander');
let _ = require('lodash');

const ROOT = require('app-root-path');
const PACKAGE = require(ROOT + '/package.json');

program
  .version(PACKAGE.version)
  .description('Micron')
  .option('-p, --port [port]', 'Port to bind to')
  .option('-e, --env [environment]', 'Exectution environment', /^(dev|development|prod|production)$/i)
  .option('-s, --syslog', 'log to syslog')
  .option('-C, --config [config directory]', 'specify the config directory')
  .option('-c, --log-color [xterm color]', 'set the color code for logging')
  .option('-P, --preserve-disk', 'Do not log to file')
  .parse(process.argv);

program.appendParams = function (set) {
  let append = function (key) {
    let trueKey = '';
    _.each(key.replace(/^-+/, '').split(/-/g), function (word, index) {
      if (index) word = word.charAt(0).toUpperCase() + word.slice(1);
      trueKey += word;
    });

    if (program[trueKey]) set.push(key); set.push(program[trueKey]);
  };

  append('--port');
  append('--env');
  append('--syslog');
  append('--config');
  append('--log-color');
  append('--preserve-disk');

  return set;
};

module.exports = program;
