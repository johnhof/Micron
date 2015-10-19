# Micron

[![npm](https://img.shields.io/npm/l/express.svg)](https://github.com/johnhof/micron/blob/master/LICENSE)  [![Dependencies](https://img.shields.io/david/johnhof/micron.svg)](https://david-dm.org/johnhof/micron) [![Join the chat at https://gitter.im/johnhof/micron](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/johnhof/micron?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Micron is a microservice architecture to allow a single stack to be used regardless of what communication method is best for the purpose. A set of micron based servers can be networked together, making requests via the [micron-client](https://github.com/johnhof/micron-client) without concern for what approach is used.

Switching from HTTP to [ØMQ](http://zeromq.org/) (and more, coming soon) is as easy as flipping a boolean in a config. On startup, the server will spawn a child process for every service specified in the `config/index.json#/services` array.

This repo contains a single user controller, a naive implementation of a user microservice. In theory, this repo can be copied and made to implement any microservice by changing only controllers, models, and configs.

Heres a pretty picture to summarize a small microservice network using micron and its client for communication.

<img src="http://i.imgur.com/fm46NVd.png?1" width="400">

- Requirements
  - Node 4.x.x
  - CouchDB (demo purposes only)
  - ØMQ

- Internal Dependencies
  - [koa](http://koajs.com/)
    - Controllers should operate is if they are a koa controller
  - [Swagger](http://swagger.io/) + [Fleek framework](https://github.com/fleekjs)
    - `config/swagger.json` is used to build the server routes
    - API documentation is displayed at `[HOST]:[PORT]/swagger`
  - [Koa Waterline](https://www.npmjs.com/package/koa-waterline) (easily swapped)
    - Builds the client for the database

`npm install && npm start` - runs `nodemon` on port 8000 in development. No timestamps in log

`npm install && PORT=8000 node server` - runs on port 8000, in production. logs include timestamps

`npm install && node server` - runs on port 80, in production

For a quick test, update sandbox files for your port configuration and run `node sandbox/http` or `node sandbox/zeromq` against a live server.

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

New services can be added to the services directory. Each service added should to its best to mimic the controller environment created by the [koa framework](http://koajs.com/). Ideally, the controllers should not concernt themselves with the communication method used to make the request

# Tests

`npm test`

# Authors

- [John Hofrichter](https://github.com/johnhof)
