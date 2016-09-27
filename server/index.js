'use strict';

let _ = require('lodash');
let fs = require('fs');
let mkdirp = require('mkdirp');
let clc = require('cli-color');
let spawn = require('child_process').spawn;
let moment = require('moment');
let bunyan = require('bunyan');
let bsyslog = require('bunyan-syslog');
let bformat = require('bunyan-format');
let path = require('path');
let mixins = require('../lib/mixins');
let stripAnsi = require('strip-ansi');

//
// Configs
//

const PROGRAM = require('../lib/commander');
const CONFIG = require('config');

//
// All important ascii art
//

const ASCII_FILE = path.resolve(__dirname + '/' + CONFIG.find('internal.motd.ascii'));
if (fs.existsSync(ASCII_FILE)) {
  const TEXT_OPTS = CONFIG.find('internal.motd.text') || [];
  const COLOR = CONFIG.find('internal.motd.color') || 80;
  console.log(clc.xterm(COLOR)(fs.readFileSync(ASCII_FILE).toString()));
  console.log('  ' + clc.xterm(COLOR)(TEXT_OPTS[Math.floor(Math.random() * TEXT_OPTS.length)]) + '\n');
}

//
// Set up logger
//

let logConf = CONFIG.internal.logging;
let streams = [
  { level: 'debug', stream: bformat({ outputMode: 'short', color: !PROGRAM.no_color }, process.stdout) },
  { level: 'error', stream: bformat({ outputMode: 'long', color: !PROGRAM.no_color}, process.stderr) },
];

if (PROGRAM.syslog) streams.push({ level: 'debug', type: 'raw', stream: bsyslog.createBunyanStream(CONFIG.resources.syslog), });
_.each(logConf.streams, (conf) => {
  if (PROGRAM.preserve_disk && (conf.type === 'file' || conf.type === 'rotating-file' || conf.path)) return;
  mkdirp.sync(path.dirname(conf.path));
  streams.push(conf);
});

logConf.streams = streams;
let log = bunyan.createLogger(logConf);

//
// Launch services
//
_.each(CONFIG.serve, (service, index) => {
  // Find service
  let servicePath = path.join(__dirname, './services/' + service);
  if (!fs.existsSync(servicePath)) {
    let error = 'Could not find service [' + servicePath + ']. Verify that the config matches services';
    log.error(error);
    throw error;
  }

  // Spawn process
  let command = PROGRAM.appendParams([servicePath]);
  let logger = log.child({ service: service });
  let proc = spawn('node', command);

  let streamHandler = function (type) {
    return (data) => {
      data = !PROGRAM.no_color ? data.toString("utf-8") : stripAnsi(data.toString("utf-8"));
      logger[type](data);
    }
  }
  proc.stdout.on('data', streamHandler('info'));
  proc.stderr.on('data', streamHandler('error'));
});
