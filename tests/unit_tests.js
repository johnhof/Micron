'use strict';

let mocha = require('co-mocha');
let expect = require('chai').expect;
let root = require('app-root-path');

const config = require('config');
const responses = config('responses');

describe('/lib', function () {
  let lib = (name) => { return require(root + '/lib/' + name); };

  describe('/response_binding', function () {
    let responseBinding = lib('response_binding');
    let ctx = {};
    responseBinding(ctx);

    it('should set `this.body` with (`status`, `data`)', function *() {
      let status = 400;
      let data = { message: 'you sent me the wrong data!' };
      let success = false;
      ctx.respond(status, data);
      expect(ctx.status).to.equal(status);
      expect(ctx.body).to.be.an('object');
      expect(ctx.body.status).to.equal(status);
      expect(ctx.body.success).to.equal(success);
      expect(ctx.body.data).to.deep.equal(data);
    });

    it('should set `this.body` to default status-body with (`status`)', function *() {
      let status = 404;
      let data = responses[status];
      ctx.respond(status);
      expect(ctx.status).to.equal(status);
      expect(ctx.body).to.be.an('object');
      expect(ctx.body.status).to.equal(status);
      expect(ctx.body.success).to.equal(false);
      expect(ctx.body.data).to.deep.equal(data);
    });

    it('should set `this.body` to success with (`data`)', function *() {
      let data = { message: 'OK' };
      ctx.respond(data);
      expect(ctx.status).to.equal(200);
      expect(ctx.body).to.be.an('object');
      expect(ctx.body.status).to.equal(200);
      expect(ctx.body.success).to.equal(true);
      expect(ctx.body.data).to.deep.equal(data);
    });
  });
});
