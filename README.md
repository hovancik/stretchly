# strechly
[![JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
[![bitHound Overall Score](https://www.bithound.io/github/hovancik/strechly/badges/score.svg)](https://www.bithound.io/github/hovancik/strechly)
[![bitHound Dependencies](https://www.bithound.io/github/hovancik/strechly/badges/dependencies.svg)](https://www.bithound.io/github/hovancik/strechly/master/dependencies/npm)
[![bitHound Dev Dependencies](https://www.bithound.io/github/hovancik/strechly/badges/devDependencies.svg)](https://www.bithound.io/github/hovancik/strechly/master/dependencies/npm)
[![bitHound Code](https://www.bithound.io/github/hovancik/strechly/badges/code.svg)](https://www.bithound.io/github/hovancik/strechly)
[![Build Status](https://travis-ci.org/hovancik/strechly.svg?branch=master)](https://travis-ci.org/hovancik/strechly)

break time reminder app

## About
*strechly* is [electron](http://electron.atom.io/) app that reminds you to take breaks when working with computer.

It runs in your tray and shows small reminder window every 10 minutes, that is open for 10 seconds (or until closed early).

You can pause/resume reminding of breaks.

## Install

There are not any installers, yet.

To run app you will need [nodejs](https://nodejs.org/). Clone the repo, run `npm install` and then simply do `npm run` to start *strechly*.

It should run on any electron supported platform. Tested on OS X and Ubuntu Linux.

### Linux note
Please see http://electron.atom.io/docs/api/tray/ for Electron's Tray Linux specifics. Having `libappindicator1` installed should be enough for *strechly*. 

## Development

Feel free to join development of this app via Issues and Pull Requests.

### TODOs and Ideas
- [ ] tests
- [x] PR tools
- [ ] make installers/executables
- [x] create about page
- [ ] create longer breaks (5min every 30 minutes)
- [ ] create settings for breaks
- [ ] remember settings after restart
- [ ] autostart app
- [ ] start break anytime from menu
- [ ] create keyboard shortcuts

### Contributors
*(by date of the first contribution)*

- Jan Hovancik, @hovancik, [hovancik.net](https://hovancik.net)

## License
See LICENSE file.
