'use strict';

let _ = require('lodash');
let fs = require('fs');
let clc = require('cli-color');
let spawn = require('child_process').spawn;
let moment = require('moment');
let mixins = require('./lib/mixins');
let toss = require('./lib/helpers').toss;

const config = require('config');
const LOGS_DIR = config.logging.directory;
const PURPLE = 53;
const COLOR_MULT = 60;
const COLOR_OFFSET = 60;

const TEXT_OPTS = ['A series of tubes.', 'Bro, do you even scale?'];
const ASCII_FILE = './services/ascii.txt';

if (fs.existsSync(ASCII_FILE)) {
  let textOpts = TEXT_OPTS;
  console.log(clc.xterm(PURPLE)(fs.readFileSync(ASCII_FILE).toString()));
  console.log('  ' + clc.xterm(PURPLE)(textOpts[Math.floor(Math.random() * textOpts.length)]) + '\n');
}

if (!fs.existsSync(LOGS_DIR)) fs.mkdirSync(LOGS_DIR);

_.each(config.services, function (service, index) {
  if (!fs.existsSync('./services/' + service)) {
    toss('Could not find service [./services/' + service + ']. Verify that the config matches services');
  }

  // logging
  let logColor = ((index * COLOR_MULT) + COLOR_OFFSET);
  let log = clc.xterm(logColor);
  let logFile = fs.createWriteStream(LOGS_DIR + '/' + service + '.log');
  let servicePrefix = service.toUpperCase() + ': ';

  // spawn process
  let proc = spawn('node', ['./services/' + service, '--log_color', logColor]);

  // stdout stream
  proc.stdout.pipe(logFile);
  proc.stdout.on('data', function (data) {
    let result = '';
    if (!config.local.isDev) {
      result = log(servicePrefix + moment.utc().toString() + ':  ') + data;
    } else {
      result = log(servicePrefix + data);
    }

    process.stdout.write(result);
  });

  // stderr stream
  proc.stderr.pipe(logFile);
  proc.stderr.on('data', function (data) {
    let result = '';
    if (!config.local.isDev) {
      result = log(servicePrefix + moment.utc().toString() + ':  ') + clc.red('ERROR: ') + data;
    } else {
      result = log(servicePrefix + clc.red('ERROR: ')  + data);
    }

    process.stderr.write(result);
  });
});
