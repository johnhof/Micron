'use strict';

let _ = require('lodash');
let yieldable = require('../helpers/yieldable');

module.exports = (opts) => {
  return function *(next) {
    this.respond = (_status, _data) => {
      let success = false;
      this.body = {};
      this.status = !_.isNumber(_status) ? 200 : _status;
      this.body = {
        success: (this.status >= 200 && this.status < 300),
        status: this.status,
        data: _data || _status || responses[this.body.status]
      };
      return this.body;
    };

    yield next;
  }
}
