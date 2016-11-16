'use strict';

module.exports = (opts) => (ctx, next) => {
  let data = ctx.data
  let missing = [];
  if (!data.method) missing.push('method');
  if (!data.path) missing.push('path');
  if (missing.length === 0) return next();
  else return Promise.reject(`Request missing: [${missing.join(',')}]`);
}
