require('isomorphic-fetch')
const BASE_URL = `http://suggestqueries.google.com/complete/search?client=chrome&q=`;

module.exports = async (term, opts = {}) => {
  const resp = await fetch(BASE_URL + term)
  const text = await resp.text()
  const [value, terms, a, b, props] = JSON.parse(text)
  const set = new Set()

  for(let [key, value] of terms.entries()) {
    let relevance = props['google:suggestrelevance'][key]
    let type = props['google:suggesttype'][key]
    set.add({value, relevance, type})
  }

  let relevance = props['google:verbatimrelevance']

  return { 
    value, 
    relevance, 
    set: [...set] 
  }
}