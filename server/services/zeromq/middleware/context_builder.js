'use strict';

module.exports = (opts) => {
  return function *(next) {
    yield next();
  }
}
