# Micron

[![npm](https://img.shields.io/npm/l/express.svg)](https://github.com/johnhof/micron/blob/master/LICENSE)  [![Dependencies](https://img.shields.io/david/johnhof/micron.svg)](https://david-dm.org/johnhof/micron) [![Join the chat at https://gitter.im/johnhof/micron](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/johnhof/micron?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)


A microservice architecture to allow a single stack to be used regardless of what communication method is bet for the purpose. A set of micron based servers can be networked together, making requests via the [micron-client](https://github.com/johnhof/micron-client) without concern for what approach is used.

Switching from http to [ØMQ](http://zeromq.org/) (and more, coming soon) is as easy as flipping a flag in a config. On startup, the server will spawn a child process for every service specified in the `config/index.json/services` array.

This repo contains a single user controller, a naive implementation of a user microservice. In theory, this repo can be copied and made to implement any microservice by changing only controllers, models, and configs.

- Requirements
  - Node 4.x.x
  - CouchDB (demo purposes only)

- Internal Dependencies
  - [koa](http://koajs.com/)
    - Controllers should operate is if they are a koa controller
  - [Swagger](http://swagger.io/) + [Fleek framework](https://github.com/fleekjs)
    - `config/swagger.json` is used to build the server routes
    - API documentation is displayed at `[HOST]:[PORT]/swagger`
  - [Koa Waterline](https://www.npmjs.com/package/koa-waterline) (easily swapped)
    - Builds the client for the database

`npm install && npm start` - runs on port 80

`npm install && PORT=8000 node server` - run on port 8000

For a quick test, run `node sandbox/http` or `node sandbox/zeromq` against a live server and checkout the js logic in the files

# Key

- [Services](#services)
  - [HTTP](#http)
  - [ØMQ](#Ømq)
- [Contributing](#contributing)
- [Tests](#tests)
- [Authors](#authors)

# Services

All services take the following

## HTTP

HTTP service operates as any REST api

## ØMQ

expects a `req` message of the structure

```javascript
{
  method: String, // request method (used to route via swagger)
  path: String, // request path (used to route via swagger)
  form: Object, // form data
  qs: Object, // query params
  parameters: Object // URL params
}
```

# Contributing


# Tests

`npm test`

# Authors

- [John Hofrichter](https://github.com/johnhof)
