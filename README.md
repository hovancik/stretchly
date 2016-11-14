# stretchly [![Build Status](https://travis-ci.org/hovancik/stretchly.svg?branch=master)](https://travis-ci.org/hovancik/stretchly)[![Build status](https://ci.appveyor.com/api/projects/status/d3eq9bs1kcysulb1?svg=true)](https://ci.appveyor.com/project/hovancik/stretchly)[![JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/) [![bitHound Overall Score](https://www.bithound.io/github/hovancik/stretchly/badges/score.svg)](https://www.bithound.io/github/hovancik/stretchly) [![bitHound Dependencies](https://www.bithound.io/github/hovancik/stretchly/badges/dependencies.svg)](https://www.bithound.io/github/hovancik/stretchly/master/dependencies/npm) [![bitHound Dev Dependencies](https://www.bithound.io/github/hovancik/stretchly/badges/devDependencies.svg)](https://www.bithound.io/github/hovancik/stretchly/master/dependencies/npm) [![bitHound Code](https://www.bithound.io/github/hovancik/stretchly/badges/code.svg)](https://www.bithound.io/github/hovancik/stretchly)

<img src="https://raw.githubusercontent.com/hovancik/stretchly/master/stretchly_128x128.png" align="right">

> break time reminder app

*stretchly* is cross-platform [electron](http://electron.atom.io/) app that reminds you to take breaks when working with computer.

By default, it runs in your tray and shows reminder window every 10 minutes, that is open for 20 seconds, containing idea for microbreak.

<img src="https://raw.githubusercontent.com/hovancik/stretchly/master/stretchly-microbreak.png" height="340">

Every 30 minutes, it shows window containing idea for longer 5 minute break.

<img src="https://raw.githubusercontent.com/hovancik/stretchly/master/stretchly-break.png" height="340">

You can pause/resume reminding of breaks. On Windows and macOS, you can set app to start at login.

<img src="https://raw.githubusercontent.com/hovancik/stretchly/master/stretchly-tray-1.png" height="150">

You can also skip to the next break or microbreak anytime from menu, or reset (restart) breaks.

<img src="https://raw.githubusercontent.com/hovancik/stretchly/master/stretchly-tray-2.png" height="150">

Microbreaks and breaks can be customized:
- you can set duration and interval of break
- you can enable/disable breaks

<img src="https://raw.githubusercontent.com/hovancik/stretchly/master/stretchly-settings-website-1.png" height="340">

- you can choose from different color schemes
- you can pick a sound to be played at the end of the break

<img src="https://raw.githubusercontent.com/hovancik/stretchly/master/stretchly-settings-website-2.png" height="340">

All settings can be reset to defaults.

## Install [![Github All Releases](https://img.shields.io/github/downloads/hovancik/stretchly/total.svg)](https://github.com/hovancik/stretchly/releases/latest)

Latest installers for macOS, Windows, Linux and FreeBSD can be found [here](https://github.com/hovancik/stretchly/releases).

On macOS you can install it by running `brew update && brew cask install stretchly`

You can create installer by running `npm run pack` or `npm run dist` after `npm install`.

## Running from source

To run app you will need [nodejs](https://nodejs.org/). Clone the repo, run `npm install` and then simply do `npm start` to start *stretchly*.

It should run on any electron supported platform. Tested on OS X, Windows and Ubuntu Linux.

### Linux note
Please see http://electron.atom.io/docs/api/tray/ for Electron's Tray Linux specifics. Having `libappindicator1` installed should be enough for *stretchly*.

## Development

Feel free to join [development](https://github.com/hovancik/stretchly/blob/master/CONTRIBUTING.md) of this app via Issues and Pull Requests.

### TODOs and Ideas
- [x] tests
- [x] PR tools
- [x] make installers/executables
- [x] create about page
- [x] only one instance
- [ ] notification on 2nd instance
- [x] create longer breaks (5min every 30 minutes)
- [x] create settings for breaks
- [x] remember settings after restart
- [x] autostart app
- [x] start break anytime from menu
- [ ] create keyboard shortcuts
- [ ] color-picker for themes
- [x] sound notification at the end of the break
- [ ] information about when will be the next break
- [x] strict mode (can't finish break early)

### Contributors
*(by date of the first contribution)*

- Jan Hovancik, @hovancik, [hovancik.net](https://hovancik.net)
- Martina Mocinecova, (*stretchly* logo), color schemes
- Jason Barry, @JCBarry, [jcbarry.com](http://jcbarry.com)

### Humans and Tools
 - https://github.com/typefoo/node-icns
 - https://developer.microsoft.com/en-us/microsoft-edge/tools/vms/
 - http://web.stanford.edu/dept/EHS/prod/general/ergo/microbreaks.html
 - https://www.spineuniverse.com/wellness/ergonomics/workstation-ergonomics-take-break
 - http://www.lifehack.org/articles/productivity/21-counter-intuitive-break-ideas-to-boost-your-productivity-at-work.html
 - http://www.latofonts.com/lato-free-fonts/

#### Sounds credits
Sounds used in this application are listed [here](http://freesound.org/people/hovancik/bookmarks/category/58865/).
- `crystal glass` by [mlteenie](http://freesound.org/people/mlteenie/), available under the [Attribution License](http://creativecommons.org/licenses/by/3.0/).
- `wind chime` by [GnoteSoundz](http://freesound.org/people/GnoteSoundz/), available under the [Creative Commons 0 License](http://creativecommons.org/publicdomain/zero/1.0/).
- `tic toc` by [magundah14](http://freesound.org/people/magundah14/), available under the [Creative Commons 0 License](http://creativecommons.org/publicdomain/zero/1.0/).
- `silence` by [parcodeisuoni](http://freesound.org/people/parcodeisuoni/), available under the [Attribution License](http://creativecommons.org/licenses/by/3.0/).

## License
See LICENSE file.
