'use strict';

module.exports = (opts) => {
  return function *(next) {
    let data = this.data
    let missing = [];
    if (!data.method) missing.push('method');
    if (!data.path)) missing.push('path');
    if (!missing.length) {
      throw Error(`Request missing: [${missing.join(,)}]`);
    } else {
      yield next();
    }
  }
};
