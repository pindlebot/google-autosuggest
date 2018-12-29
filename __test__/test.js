const data = require('./data.json')
const autosuggest = require('../')

it('should fetch keywords', async () => {
  const result = await autosuggest('javascript')
  expect(result).toMatchObject(data)
})