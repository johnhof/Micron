'use strict';


let _ = require('lodash');
let net = require('net');
let comise = require('comise');
let request = require('request-promise');
let URL = require('url');

const PREFIX           = '://';
const TIMEOUT          = 20000;
const PROTOCOL_DEFAULT = 'http';
const CONFIG           = require('config');

let tcp_check = (address, port) => {
  return new Promise( (resolve, reject) => {
    var client = new net.Socket();
    client.connect({address: address, port: port}, () => {
      resolve(true);
    });

    client.on('error', (err) => {
      if (err.code == "ENOTFOUND") {
         console.error("[ERROR] No client found at this address!");
         if (client.clientSocket) client.clientSocket.destroy();
         return resolve(false);
       } else if (err.code == "ECONNREFUSED") {
         console.error("[ERROR] Connection refused! Please check the IP.");
         if (client.clientSocket) client.clientSocket.destroy();
         return resolve(false);
       } else {
         console.error('[ERROR] ' + err.code);
         if (client.clientSocket) client.clientSocket.destroy();
         return resolve(false);
       }
    });
  });
};

let probe = function (config) {
  return comise(function *(){
    if (!config.host) return { error: 'Probe failed' };

    let defaultPort = ((config.protocol || '') == 'https') ? 443 : 80;
    let url = {
      host: config.host,
      protocol: config.protocol || (PROTOCOL_DEFAULT),
      port: config.port || defaultPort
    };
    let result;
    try {
      switch (url.protocol) {
        case 'http':
        case 'https':
          result = yield request({ timeout: TIMEOUT, uri: URL.format(url), method:'get'});
        break;
        case 'tcp':
          result = yield tcp_check(url.host, url.port);
        break;
      }
    } catch (e) {
      if (!/parse\s+error/i.test(e.stack)) console.log(e.name + ': ' + e.message);
      let eIs = (str) => e.stack.indexOf(str) === -1;
      result = (eIs('ECONNREFUSED') && eIs('ENOTFOUND') && eIs('ETIMEDOUT'));
    }

    return {
      host: config.host || false,
      alive: (!!result)
    };
  });
};

probe.all = (set) => {
  return Promise.all(_.map(set, (config, name) => {
    return comise(function *(){
      let probeResult = yield probe(config) || {};
      return {
        name: name || '',
        alive: (probeResult && probeResult.alive) ? probeResult.alive : false
      };
    });
  }));
}


module.exports.get = function *() {
  let ctx = this;
  let response = {
    status: 'OK',
    version: CONFIG.package.version || null,
    resources: [],
    services: []
  };

  try {
    // get the status of other micron services
    if (!ctx.request.query.shallow) {

      let services = yield ctx.micron.status();
      response.services = _.map(services, (content, name) => {
        return {
          name: name || '',
          alive: ( !!(content && content.status) || false)
        }
      }) || [];
    }

    response.resources = yield probe.all(CONFIG.resources) || [];

  } catch (err) {
    console.error(err.stack || err);
  }

  ctx.respond(response);
};
