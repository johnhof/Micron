'use strict';


let _       = require('lodash');
let net     = require('net');
let comise  = require('comise');
let request = require('request-promise');

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
         client.clientSocket.destroy();
         return resolve(false);
       } else if (err.code == "ECONNREFUSED") {
         console.error("[ERROR] Connection refused! Please check the IP.");
         client.clientSocket.destroy();
         return resolve(false);
       } else {
         console.error('[ERROR] ' + err.code);
         client.clientSocket.destroy();
         return resolve(false);
       }
    });
  });
};

let probe = function (config) {
  return comise(function *(){
    let host     = config.host ? config.host : null;
    let protocol = config.protocol ? config.protocol : (PROTOCOL_DEFAULT);
    let port     = config.port ? config.port : ( ( (protocol == 'https') ? 443 : 80) || 80);
    let result;
    if (!host) return { error: 'Probe failed' };
    try {
      switch (protocol) {
        case 'http':
          result = host ? yield request({ timeout: TIMEOUT, uri: (protocol + PREFIX + host), method:'get'}) : null;
        break;
        case 'https':
          result = host ? yield request({ timeout: TIMEOUT, uri: (protocol + PREFIX + host), method:'get'}) : null;
        break;
        case 'tcp':
          result = host ? yield tcp_check(host, port) : null;
        break;
      }
    } catch (e) {
      if (!/parse\s+error/i.test(e.stack)) console.log(e.name + ': ' + e.message);
      let eIs = (str) => e.stack.indexOf(str) === -1;
      result = (eIs('ECONNREFUSED') && eIs('ENOTFOUND') && eIs('ETIMEDOUT'));
    }

    return {
      host: host ? host : null,
      alive: (!!result) || false
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
