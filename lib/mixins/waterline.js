'use strict';

let _ = require('lodash');
let co = require('co');
let fs = require('fs');
let Path = require('path');


const CONFIG= require('config');
const MODEL_DIR = Path.resolve(__dirname + '/../../models');

module.exports = function(config) {
  let collections = config.waterline.collections;

  let paginate = config.waterline.paginate = function(set, pagination, filter) {
    if (!(set && set.length)) { return set; }

    pagination = pagination || {};
    let result = set;

    if (filter) {
      let newResult = [];
      _.each(result, function(value, key) {
        let newVal = filter.call(value, value, key);
        if (typeof newVal !== 'undefined') newResult.push(newVal);
      });

      result = newResult;
    }

    if (pagination.sort) {
      result = _.sortBy(result, function(sorting) {
        if (sorting && sorting[pagination.sort]) {
          let data = new Date(sorting[pagination.sort]) || sorting[pagination.sort];
          return data;
        }
      });
    }

    let ascend = /^desc|reverse$/i.test(pagination.order);
    if (!ascend) { result = result.reverse(); }

    let length = result.length     || 0;
    let start  = pagination.skip   || 0;
    let limit  = +(pagination.limit || 10) + +start;
    let stop   = limit < result.length ? limit : result.length;

    return { result: result.slice(start, stop), total: length };
  };

  fs.readdirSync(MODEL_DIR).forEach((model)=>{
    if (fs.statSync(Path.join(MODEL_DIR, model)).isDirectory()) {
      try {
        require(`${MODEL_DIR}/${model}/methods.js`)(collections);
      } catch (e) {
        console.log(e.stack);
      }
    }
  });
};
