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

//
// Configs
//

const PROGRAM = require('../lib/commander');
const CONFIG = require('config');

//
// All important ascii art
//

const MOTD = CONFIG.find('internal.motd');
if (fs.existsSync(MOTD.ascii)) {
  let text = MOTD.text || [];
  let colorize = CONFIG.local.isDev ? clc.xterm(MOTD.color || 80) : (s)=>s;
  console.log(colorize(fs.readFileSync(MOTD.ascii).toString()));
  console.log('  ' + colorize(text[Math.floor(Math.random() * text.length)]) + '\n');
}


//
// Launch services
//

let procs = [];
_.each(CONFIG.serve, (service, index) => {
  // Find service
  let servicePath = path.join(__dirname, './services/' + service);
  if (!fs.existsSync(servicePath)) {
    let error = `Could not find service [${servicePath}]. Verify that the config matches services`;
    log.error(error);
    throw error;
  }

  // Spawn process
  let command = PROGRAM.appendParams([servicePath]);
  let proc = spawn('node', command, { stdio: 'inherit' });
  procs.push(proc);
  proc.on('close', () => {
    console.log(`FATAL ERROR: [${service}] proccess has died. Terminating all attached processes.`);
    for (let i in procs) procs[i].kill();
    process.exit();
  });
});
