'use strict';

let zquest = require('zquest');

zquest({data: {
  method: 'GET',
  path: '/'
}}).then((r) => {
  console.log(r);
  process.exit();
}).catch((e) => {
  console.log(e);
  process.exit();
});
