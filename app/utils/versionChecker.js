class VersionChecker {
  latest () {
    return fetch(
      'https://api.github.com/repos/hovancik/stretchly/releases/latest',
      {
        method: 'GET',
        headers: { 'User-Agent': 'hovancik/stretchly' },
        mode: 'cors',
        cache: 'default'
      })
      .then(response => response.text())
      .then(body => JSON.parse(body).tag_name)
      .catch(() => {})
  }
}

module.exports = VersionChecker
