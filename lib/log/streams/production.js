'use strict';

let Writable = require('stream').Writable;

const LEVEL = {
  10: 'TRACE',
  20: 'DEBUG',
  30: 'INFO',
  40: 'WARN',
  50: 'ERROR',
  60: 'FATAL',
};

class ProductionStream extends Writable {
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

    msg.type = msg.widget_type;
    delete msg.pid;
    delete msg.v;
    delete msg.widget_type;
    msg.level = LEVEL[msg.level];
    msg.service_id = msg.hostname.split('.')[0];
    delete msg.hostname;
    this.out.write(JSON.stringify(msg)+'\n');
    cb();
  }
}

module.exports = ProductionStream;
