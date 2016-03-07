'use strict';

let _ = require('lodash');
let fs = require('fs');
let clc = require('cli-color');
let spawn = require('child_process').spawn;
let moment = require('moment');
let mixins = require('./lib/mixins');
let toss = require('./lib/helpers').toss;
let bunyan = require('bunyan');

const PROGRAM = require('./lib/commander');
const CONFIG = require('config');
const LOGS_DIR = CONFIG.logging.directory;
const PURPLE = 53;
const COLOR_MULT = 60;
const COLOR_OFFSET = 60;

const TEXT_OPTS = ['Turtles all the way down', 'Bro, do you even scale?'];

// All important ascii art
const ASCII_FILE = CONFIG.find('internal.motd.ascii');
if (fs.existsSync()) {
  let textOpts = CONFIG.find('internal.motd.text');
  console.log(clc.xterm(PURPLE)(fs.readFileSync(ASCII_FILE).toString()));
  console.log('  ' + clc.xterm(PURPLE)(textOpts[Math.floor(Math.random() * textOpts.length)]) + '\n');
}

// Set up logger
let logConf = CONFIG.logger;
logConf.name = CONFIG.package.name;
logConf.streams.push({ level: 'debug', stream: process.stdout });
logConf.streams.push({ level: 'error', stream: process.stderr });
logConf.streams.push({ level: 'error', stream: process.stderr });
if (!fs.existsSync(LOGS_DIR) && !PROGRAM.preserveDisk) logConf.streams.push({ level: 'info', stream: LOGS_DIR });
let log = bunyan.createLogger(logConf);

_.each(CONFIG.services, function (service, index) {
  if (!fs.existsSync('./services/' + service)) {
    toss('Could not find service [./services/' + service + ']. Verify that the CONFIG matches services');
  }

  // Logging
  let logColor = ((index * COLOR_MULT) + COLOR_OFFSET);
  let log = clc.xterm(logColor);
  let logFile = PROGRAM.preserveDisk ? false : fs.createWriteStream(LOGS_DIR + '/' + service + '.log');
  let servicePrefix = service.toUpperCase() + ': ';

  let command = PROGRAM.appendParams(['./services/' + service]);

  // Spawn process
  let proc = spawn('node', command);

  // Stdout stream
  if (logFile) proc.stdout.pipe(logFile);
  proc.stdout.on('data', function (data) {
    let result = '';
    if (!CONFIG.local.isDev) {
      result = log(servicePrefix + moment.utc().toString() + ':  ') + data;
    } else {
      result = log(servicePrefix) + data;
    }

    process.stdout.write(result);
  });

  // Stderr stream
  if (logFile) proc.stderr.pipe(logFile);
  proc.stderr.on('data', function (data) {
    let result = '';
    if (!CONFIG.local.isDev) {
      result = log(servicePrefix + moment.utc().toString() + ':  ') + clc.red('ERROR: ') + data;
    } else {
      result = log(servicePrefix + clc.red('ERROR: ')) + data;
    }

    process.stderr.write(result);
  });
});
