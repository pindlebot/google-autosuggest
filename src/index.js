
require('isomorphic-fetch')
const get = require('lodash.get')
const flatten = require('lodash.flatten')
const fs = require('fs')
const crypto = require('crypto')

const BASE_URL = `http://suggestqueries.google.com/complete/search?client=chrome&q=`;

const createKey = () => crypto.randomBytes(16).toString('hex')

function mapData(data) {
  var term = get(data, [0])
  var relevance = get(data, [4, 'google:suggestrelevance'])
  var types = get(data, [4, 'google:suggesttype'])
  var nodeId = createKey()

  var leaves = get(data, [1]).map((s, i) => ({
    leafName: s,
    leafId: createKey(),
    nodeId: nodeId,
    relevance: relevance[i],
    type: types[i],
  }))

  return {
    nodeName: get(data, [0]),
    nodeId: nodeId,
    leaves: leaves,
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

const fetchAll = (params) => Promise.all(params.map(param => 
  fetchSuggestions(param))
)

async function Autosuggest(params, opts = {}) {
  
  var keywords = []

  if(typeof params === 'string') {
    keywords.push(params)
  } else if(Array.isArray(params)) {
    keywords = params.slice(0)
  } else {
    console.error('Argument must be a string or an array.')
    return {}
  }

  if(opts.recursive) {
    let nodes = await fetchAll(keywords)

    return Promise.all(
      nodes.map(async node => ({
        children: await fetchAll(node.leaves.map(s => s.leafName)),
        parents: nodes
      }))
    )
  } else {
    return fetchAll(keywords)
  }
 
}

if(process.env.NODE_ENV === 'test') {

  Autosuggest('javascript', { recursive: true })
    .then(resp => fs.writeFile('test.json', JSON.stringify(resp), () => {}))
}

module.exports = Autosuggest