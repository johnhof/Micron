'use strict';

let _ = require('lodash');
let fs = require('fs');
let clc = require('cli-color');
let spawn = require('child_process').spawn;
let moment = require('moment');
let mixins = require('./lib/mixins');
let toss = require('./lib/helpers').toss;

const PROGRAM = require('./lib/commander');
const CONFIG = require('config');
const LOGS_DIR = CONFIG.logging.directory;
const PURPLE = 53;
const COLOR_MULT = 60;
const COLOR_OFFSET = 60;

const TEXT_OPTS = ['Turtles all the way down', 'Bro, do you even scale?'];
const ASCII_FILE = './services/ascii.txt';

if (fs.existsSync(ASCII_FILE)) {
  let textOpts = TEXT_OPTS;
  console.log(clc.xterm(PURPLE)(fs.readFileSync(ASCII_FILE).toString()));
  console.log('  ' + clc.xterm(PURPLE)(textOpts[Math.floor(Math.random() * textOpts.length)]) + '\n');
}

if (!fs.existsSync(LOGS_DIR)) fs.mkdirSync(LOGS_DIR);

_.each(CONFIG.services, function (service, index) {
  if (!fs.existsSync('./services/' + service)) {
    toss('Could not find service [./services/' + service + ']. Verify that the CONFIG matches services');
  }

  // logging
  let logColor = ((index * COLOR_MULT) + COLOR_OFFSET);
  let log = clc.xterm(logColor);
  let logFile = fs.createWriteStream(LOGS_DIR + '/' + service + '.log');
  let servicePrefix = service.toUpperCase() + ': ';

  let command = ['./services/' + service];
  if (PROGRAM['log-color']) command.push('--log-color'); command.push(PROGRAM['log-color']);
  if (PROGRAM.config) command.push('--config'); command.push(PROGRAM.config);
  if (PROGRAM.syslog) command.push('--syslog'); command.push(PROGRAM.syslog);

  // spawn process
  let proc = spawn('node', command);

  // stdout stream
  proc.stdout.pipe(logFile);
  proc.stdout.on('data', function (data) {
    let result = '';
    if (!CONFIG.local.isDev) {
      result = log(servicePrefix + moment.utc().toString() + ':  ') + data;
    } else {
      result = log(servicePrefix) + data;
    }

    process.stdout.write(result);
  });

  // stderr stream
  proc.stderr.pipe(logFile);
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
