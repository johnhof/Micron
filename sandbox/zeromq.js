'use strict';

let request = require('co-request');
let co = require('co');
let micron = require('micron-client');
let _ = require('lodash');
let toss = require('../lib/helpers').toss;

const config = require('config');

let client = micron({
  userService : {
    method: 'zeromq',
    prefix: 'v1',
    host: '127.0.0.1',
    port: 8000
  }
});

let log = function () {
  let args = [];
  _.each(arguments, function (arg, index) {
    args.push (_.isObject(arg) ? JSON.stringify(arg, null, '  ') : arg);
  });

  console.log.apply(console.log, args);
};

co(function *() {
  let result;
  let user;

  let start = new Date();
  log('start: ' + start);

  log('\n++++++++++++++++++++++++++++++++++++\n');

  result = yield client.userService.post('user/create', {
    first_name: 'test',
    last_name: 'tester',
    email: 'test@tester.com',
    password: 'Tester@1'
  });
  log(result);
  if (result.status !== 201) toss('Failed to create user');
  user = result.data;

  log('\n-------------------------------------\n');

  result = yield client.userService.get('user/{id}', {
    parameters: {
      id: user.id
    }
  });
  log(result);

  log('\n-------------------------------------\n');

  result = yield client.userService.put('user/{id}/update', {
    parameters: {
      id: user.id
    },
    body: {
      last_name: 'Testington'
    }
  });
  log(result);

  log('\n-------------------------------------\n');

  result = yield client.userService.delete('user/{id}/remove', {
    parameters: {
      id: user.id
    }
  });
  log(result);

  log('\n++++++++++++++++++++++++++++++++++++\n');

  let end = new Date();
  log('end: ' + end);
  log('duration: ' + (end - start));

  process.exit();

}).catch(function (e) {
  console.error(e.stack);
  process.exit();
});
