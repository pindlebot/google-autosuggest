
require('isomorphic-fetch')
const get = require('lodash.get')
const flatten = require('lodash.flatten')
const fs = require('fs')
const utf8 = require('utf8')
const base64 = require('base-64')
const BASE_URL = `http://suggestqueries.google.com/complete/search?client=chrome&q=`;

const encode = str => base64.encode(utf8.encode(str))

const createKey = () => crypto.randomBytes(16).toString('hex')

function mapData(data) {
  var nodeName = get(data, [0])
  var nodeId = encode(nodeName)

  var relevance = get(data, [4, 'google:suggestrelevance'])
  var types = get(data, [4, 'google:suggesttype'])


  var leaves = get(data, [1]).map((s, i) => ({
    leafName: s,
    leafId: encode(s),
    nodeId: nodeId,
    relevance: relevance[i],
    type: types[i],
  }))

  return {
    nodeName,
    nodeId,
    leaves,
  }
}

async function fetchSuggestions(term) {
  var url = BASE_URL + term;
  var resp = await fetch(url)
  var text = await resp.text()
  var obj = await JSON.parse(text)
  var data = mapData(obj)
  
  return data;
}

const fetchAll = (params) => Promise.all(params.map(param => fetchSuggestions(param)))

async function Autosuggest(params, opts = {}) {
  
  var seeds = []

  if(typeof params === 'string') {

    seeds.push(params)
  } else if(Array.isArray(params)) {
    
    seeds = params.slice(0)
  } else {
    
    console.error('Argument must be a string or an array.')
    return {}
  }

  return fetchAll(seeds)
}

if(process.env.NODE_ENV === 'test') {

  Autosuggest('javascript', { recursive: true })
    .then(resp => fs.writeFile('test.json', JSON.stringify(resp), () => {}))
}

module.exports = Autosuggest