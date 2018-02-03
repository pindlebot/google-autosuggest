require('./')('javascript').then(resp => {
  require('fs').writeFile('example.json', JSON.stringify(resp), () => {})
})