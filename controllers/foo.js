'use strict';

let thenify = require('thenify');

module.exports.post = function *() {
  let ctx = this;
  let body = ctx.request.body;
  let Foo = ctx.waterline.collections.foo;
  let exists = yield Foo.findOne({
    email: body.email,
  });

  if (exists) {
    return ctx.respond(412, 'Foo Exists');
  } else {
    let foo = yield Foo.create({
      email: body.email,
      password: body.password,
      first_name: body.first_name,
      last_name: body.last_name,
    });

    if (foo) {
      return ctx.respond(201, foo);
    } else {
      return ctx.respond(500, 'Failed to create foo');
    }
  }
};

module.exports.get = function *() {
  let ctx = this;
  let foo = yield ctx.waterline.collections.foo.findOne({
    _id: ctx.params.id,
  });

  if (foo) return ctx.respond(foo);
};

module.exports.put = function *() {
  let ctx = this;
  let body = ctx.request.body;
  let Foo = ctx.waterline.collections.foo;
  let foo = yield Foo.findOne({ _id: ctx.params.id });

  let update = {};
  if (body.first_name) update.first_name = body.first_name;
  if (body.last_name) update.last_name = body.last_name;

  if (foo.id) {
    foo = yield thenify(Foo.merge)(foo.id, update);
    return ctx.respond(foo);
  }
};

module.exports.delete = function *() {
  let ctx = this;
  let Foo = ctx.waterline.collections.foo;
  let foo = yield Foo.findOne({ _id: ctx.params.id });

  if (foo.id) {
    yield Foo.destroy({ _id: foo.id });
    return ctx.respond('Foo deleted');
  }
};
