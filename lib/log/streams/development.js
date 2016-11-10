'use strict';

let chalk = require('chalk');
let Writable = require('stream').Writable;

const LEVEL = {
  10: { text: 'TRACE', color: 'cyan', },
  20: { text: 'DEBUG', color: 'blue', },
  30: { text: 'INFO', color: 'green', },
  40: { text: 'WARN', color: 'yellow', },
  50: { text: 'ERROR', color: 'magenta', },
  60: { text: 'FATAL', color: 'red', },
};

class DevelopmentStream extends Writable {
  constructor(options, out) {
    super(options, out);
    this.out = out || process.stdout;
  }

  _write(chunk, encoding, cb) {
    let msg = chunk.toString();
    try {
      msg = JSON.parse(msg);
    } catch (e) {
      this.out.write(msg);
      return cb();
    }
    let lvl = LEVEL[msg.level];
    let time = chalk.grey(msg.time);
    let level = chalk[lvl.color](lvl.text);
    let type = chalk.grey(msg.widget_type || '?');
    // console.log(`[${time}] ${level} (${type}): ${msg.msg}`)
    this.out.write(`[${time}] ${level} (${type}): ${msg.msg}\n`);
    return cb();
  }
}

module.exports = DevelopmentStream;
