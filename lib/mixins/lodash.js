'use strict';

let _ = require('lodash');
let genit = require('genit');

module.exports = function () {
  let mixins = {};

  mixins.findProperty = function (obj, query) {
    let querySplit = (query || '').split('.');
    let result = obj || this;
    let depthCount = 0;

    try {
      _.each(querySplit, function (propName) {

        // check for arrays
        if (/\[\d\]/.test(propName)) {
          let leadMatch = propName.match(/^(.*?)\[/) || [];
          let trailMatch = propName.match(/.*\](.*)$/) || [];
          let leadingProp = leadMatch[1];
          let trailingProp = trailMatch[1];
          let arrOnly = propName.replace(leadingProp, '');
          arrOnly = arrOnly.replace(trailingProp, '');
          arrOnly = _.compact(arrOnly.replace(/\[/g, '').split(']'));

          result = result[leadingProp];
          _.each(arrOnly, function (index) { result = result[parseInt(index, 10)]; });

          result = trailingProp ? result[trailingProp] : result;

        // simple prop
        } else {
          result = result[propName];
        }
      });
    } catch (e) {
      result = undefined;
    }

    return result;
  };

  _.mixin(mixins);

  genit.inject(_);
};
