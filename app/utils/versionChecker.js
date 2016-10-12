class VersionChecker {
  latest (callback) {
    fetch('https://api.github.com/repos/hovancik/stretchly/releases/latest', {
      method: 'GET',
      headers: {'User-Agent': 'hovancik/stretchly'},
      mode: 'cors',
      cache: 'default'
    }).then(function (response) {
      return response.text()
    }).then(function (body) {
      let json = JSON.parse(body)
      callback(json.tag_name)
    }).catch(function (ex) {
      callback('Error getting latest version')
    })
  }
}

module.exports = VersionChecker
