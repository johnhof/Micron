'use strict';

module.exports = (opts) => {
  return function *(next) {
    try {
      yield next();
    } catch (e) {
      console.log(e.stack || e);
      this.response = {
        status: 500,
        success: false,
        data: 'Internal server error'
      };
    }
  }
};
