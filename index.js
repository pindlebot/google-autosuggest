const fetch = require('isomorphic-fetch')

module.exports = async (term, opts = {}) => {
  const url = new URL('http://suggestqueries.google.com/complete/search')
  url.searchParams.append('client', 'chrome')
  url.searchParams.append('q', term)
  const resp = await fetch(url.toString())
  const text = await resp.text()
  const [value, terms, a, b, props] = JSON.parse(text)

  const set = terms.map((value, index) => {
    let relevance = props['google:suggestrelevance'][index]
    let type = props['google:suggesttype'][index]
    return {
      value,
      relevance,
      type
    }
  })

  const relevance = props['google:verbatimrelevance']

  return { 
    value, 
    relevance, 
    set
  }
}