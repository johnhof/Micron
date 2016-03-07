# Micron

[![npm](https://img.shields.io/npm/l/express.svg)](https://github.com/johnhof/micron/blob/master/LICENSE)  [![Dependencies](https://img.shields.io/david/johnhof/micron.svg)](https://david-dm.org/johnhof/micron) [![Join the chat at https://gitter.im/johnhof/micron](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/johnhof/micron?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Micron is a microservice architecture template to allow a single stack to be used regardless of what communication method is best for the purpose. A set of micron based servers can be networked together, making requests via the [micron-client](https://github.com/johnhof/micron-client) without concern for what approach is used.

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

`npm install && node server` - runs `nodemon` on port 1991 in development

For a quick test, update sandbox files for your port configuration and run `node sandbox/http` or `node sandbox/zeromq` against a live server.

# Key

- [Configuration](#confirguration)
- [Starting a New Micron Service](#starting-a-new-micron-service)
- [Services](#services)
  - [HTTP](#http)
  - [ØMQ](#Ømq)
- [Contributing](#contributing)
- [Tests](#tests)
- [Authors](#authors)

# Configuration

Configuration options are always set in the same order: `JSON Configs` ->  `Command Line Flags` -> `Environment Variables`

### Environment Variables

- `NOD_ENV`
  - Determines various aspects of functionality
  - Options:
    - `dev|development`
      - Logs are all prefixed with the service (`ZERO:  `, `HTTP:  `, etc)
    - `prod|production`
      - Logs are all prefixed with the service and ISO 8601 timestamp (`ZERO:  Sun Nov 08 2015 22:37:46 GMT+0000`, `HTTP:  Sun Nov 08 2015 22:37:46 GMT+0000`, etc)
- `PORT`
  - The port on which the http service will listen
  - Options: `Number`

### Command Flags

- `-p`, `--port [port]`
  - The port on which the http service will listen
  - Options: `Number`
- `-e`, `--env [environment]`
  - Determines various aspects of functionality
  - Options:
    - `dev|development`
      - Logs are all prefixed with the service (`ZERO:  `, `HTTP:  `, etc)
    - `prod|production`
      - Logs are all prefixed with the service and ISO 8601 timestamp (`ZERO:  Sun Nov 08 2015 22:37:46 GMT+0000`, `HTTP:  Sun Nov 08 2015 22:37:46 GMT+0000`, etc)
- `-s`, `--syslog`
  - Pipe logs to syslog
- `-C`, `--config [config directory]`
  - External config directory
  - Options: `String` path to config directory
- `-c`, `--log-color [xterm code]`
  - Xterm color code as the base color for logs
  - Options: `Number`
- `-P`, `--preserve-disk`
  - Do not write logs to disk

### Config

_Index.json_

```js
{
  "serve": ["http", "zeromq"], // services to run
  "internal": {

    // internal configs

    "logging": {

      // bunyan config

    }
  },
  "external": {

    // thirds party configs

  },
  "resources": {

    // DBs and other resource configs

  },
  "services":{

    // other micron dependency configs

  }
}

```

# Starting a New Micron Service

The following pattern is recommended when starting a new micron service

- `$ git clone git@github.com:johnhof/micron.git [NEW_PROJECT_NAME]`
- `$ cd [NEW_PROJECT_NAME]`
- `$ git remote rename origin micron`
- `$ git remote add origin [NEW_PROJECT_GIT_REPO]`

This will allow you to pull new features, service support, and bug fix's from the micron repository, while still allowing you adjust and fill out the micron template as normal.

For example, too pull in a bug fix or a service, you now only have to run `$ git pull micron master` and resolve any merge conflics, rather than hand editing the files.


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
