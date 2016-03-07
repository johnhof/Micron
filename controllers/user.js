'use strict';

let thenify = require('thenify');

module.exports.post = function *() {
  let ctx = this;
  let body = ctx.request.body;
  let User = ctx.waterline.collections.user;
  let exists = yield User.findOne({
    email: body.email,
  });

  if (exists) {
    return ctx.respond(412, 'User Exists');
  } else {
    let user = yield User.create({
      email: body.email,
      password: body.password,
      first_name: body.first_name,
      last_name: body.last_name,
    });

    if (user) {
      return ctx.respond(201, user);
    } else {
      return ctx.respond(500, 'Failed to create user');
    }
  }
};

module.exports.get = function *() {
  let ctx = this;
  let user = yield ctx.waterline.collections.user.findOne({
    _id: ctx.params.id,
  });

  if (user) return ctx.respond(user);
};

module.exports.put = function *() {
  let ctx = this;
  let body = ctx.request.body;
  let User = ctx.waterline.collections.user;
  let user = yield User.findOne({ _id: ctx.params.id });

  let update = {};
  if (body.first_name) update.first_name = body.first_name;
  if (body.last_name) update.last_name = body.last_name;

  if (user.id) {
    user = yield thenify(User.merge)(user.id, update);
    return ctx.respond(user);
  }
};

module.exports.delete = function *() {
  let ctx = this;
  let User = ctx.waterline.collections.user;
  let user = yield User.findOne({ _id: ctx.params.id });

  if (user.id) {
    yield User.destroy({ _id: user.id });
    return ctx.respond('User deleted');
  }
};
