'use strict';

let fetchSuggestions = (() => {
  var _ref = _asyncToGenerator(function* (term) {
    var url = BASE_URL + term;
    var resp = yield fetch(url);
    var text = yield resp.text();
    var obj = yield JSON.parse(text);
    var data = mapData(obj);

    return data;
  });

  return function fetchSuggestions(_x) {
    return _ref.apply(this, arguments);
  };
})();

let Autosuggest = (() => {
  var _ref2 = _asyncToGenerator(function* (params, opts = {}) {

    var seeds = [];

    if (typeof params === 'string') {

      seeds.push(params);
    } else if (Array.isArray(params)) {

      seeds = params.slice(0);
    } else {

      console.error('Argument must be a string or an array.');
      return {};
    }

    return fetchAll(seeds);
  });

  return function Autosuggest(_x2) {
    return _ref2.apply(this, arguments);
  };
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

require('isomorphic-fetch');
const get = require('lodash.get');
const flatten = require('lodash.flatten');
const fs = require('fs');
const crypto = require('crypto');

const BASE_URL = `http://suggestqueries.google.com/complete/search?client=chrome&q=`;

const createKey = () => crypto.randomBytes(16).toString('hex');

function mapData(data) {
  var term = get(data, [0]);
  var relevance = get(data, [4, 'google:suggestrelevance']);
  var types = get(data, [4, 'google:suggesttype']);
  var nodeId = createKey();

  var leaves = get(data, [1]).map((s, i) => ({
    leafName: s,
    leafId: createKey(),
    nodeId: nodeId,
    relevance: relevance[i],
    type: types[i]
  }));

  return {
    nodeName: get(data, [0]),
    nodeId: nodeId,
    leaves: leaves
  };
}

const fetchAll = params => Promise.all(params.map(param => fetchSuggestions(param)));

if (process.env.NODE_ENV === 'test') {

  Autosuggest('javascript', { recursive: true }).then(resp => fs.writeFile('test.json', JSON.stringify(resp), () => {}));
}

module.exports = Autosuggest;