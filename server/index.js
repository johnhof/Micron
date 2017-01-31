'use strict';

let _ = require('lodash');
let fs = require('fs');
let chalk = require('chalk');
let spawn = require('child_process').spawn;
let path = require('path');
let log = require('../lib/log');

//
// Configs
//

const PROGRAM = require('../lib/commander');
const VAR = process.env;

//
// All important ascii art
//
console.log(VAR.ENVIRONMENT === 'development')
if ((VAR.ENVIRONMENT === 'development') && fs.existsSync(VAR.MICRON_MOTD_ASCII)) {
  let text = (VAR.MICRON_MOTD_TEXT || '').split('::');
  let colorize = chalk[VAR.MICRON_MOTD_COLOR] || ((s)=>s);
  console.log(colorize(fs.readFileSync(VAR.MICRON_MOTD_ASCII).toString()));
  console.log('  ' + colorize(text[Math.floor(Math.random() * text.length)]) + '\n');
}

//
// Launch services
//

let procs = [];
_.each(VAR.MICRON_SERVICES.split(','), (service, index) => {
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
