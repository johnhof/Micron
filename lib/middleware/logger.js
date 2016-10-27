'use strict';

module.exports = function (opts) {
  return function *(next) {
    let method = this.method.toString();
    console.log(`<-- ${method} ${this.path}`);
    yield next();
    console.log(`--> ${method} ${this.path} ${this.body.status}`);
  }
}
