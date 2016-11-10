'use strict';

let request = require('request-promise');

request.get('http://localhost:1991/').then((r) => {
  console.log(r)
}).catch((e) => console.log(e));
