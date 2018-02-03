
## Google Autosuggest

You know how when you start typing on Google that autocomplete dropdown appears with common/relevant searches?

Given a search term, this package fetches those suggested searches from Google.

### Example

```js

require('google-autosuggest')('javascript').then(resp => {
  console.log(resp)
  /*
    {
      "value": "javascript",
      "relevance": 1300,
      "set": [
        { "value": "javascript snake", "relevance": 601, "type": "QUERY" },
        { "value": "javascript array", "relevance": 600, "type": "QUERY" },
        ...
      ]
    }
  */
})