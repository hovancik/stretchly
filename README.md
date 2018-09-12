# stretchly [![Build Status](https://travis-ci.org/hovancik/stretchly.svg?branch=master)](https://travis-ci.org/hovancik/stretchly) [![Build status](https://ci.appveyor.com/api/projects/status/d3eq9bs1kcysulb1?svg=true)](https://ci.appveyor.com/project/hovancik/stretchly) [![JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/) [![codecov](https://codecov.io/gh/hovancik/stretchly/branch/master/graph/badge.svg)](https://codecov.io/gh/hovancik/stretchly) [![Join the chat at https://gitter.im/stretchly/Lobby](https://badges.gitter.im/stretchly/Lobby.svg)](https://gitter.im/stretchly/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)


<img src="https://raw.githubusercontent.com/hovancik/stretchly/master/stretchly_128x128.png" align="right">

> break time reminder app

*stretchly* is a cross-platform [electron](http://electron.atom.io/) app that reminds you to take breaks when working on your computer.

[![Become a Patron!](https://c5.patreon.com/external/logo/become_a_patron_button.png)](https://www.patreon.com/hovancik)

By default, it runs in your tray and displays a reminder window containing an idea for a microbreak for 20 seconds every 10 minutes.

<img src="https://raw.githubusercontent.com/hovancik/stretchly/master/stretchly-microbreak.png" height="340">

Every 30 minutes, it displays a window containing an idea for a longer 5 minute break.

<img src="https://raw.githubusercontent.com/hovancik/stretchly/master/stretchly-break.png" height="340">

The user gets notified 30 seconds before each break to be able to prepare to pause the work.

<img src="https://raw.githubusercontent.com/hovancik/stretchly/master/stretchly-notification.png" height="90">

You can close the break or microbreak window early by clicking the link at the bottom
or by using `Ctrl/Cmd + x` keyboard shortcut (when not in strict mode).

You can pause/resume *stretchly*'s break reminders. On Windows and macOS, you can set the app to start at login.

<img src="https://raw.githubusercontent.com/hovancik/stretchly/master/stretchly-tray-1.png" height="150">

You can also skip to the next break or microbreak anytime from the menu, or reset (restart) breaks.

<img src="https://raw.githubusercontent.com/hovancik/stretchly/master/stretchly-tray-2.png" height="150">

The tray tooltip shows information about how much time is left till the next (micro)break, the number of microbreaks until the next break, or the time remaining in pause till breaks resume.

<img src="https://raw.githubusercontent.com/hovancik/stretchly/master/stretchly-tray-3.png" height="90">

Microbreaks and breaks can be customized:
- you can set the duration and interval of breaks
- you can enable/disable breaks
- you can enable/disable strict mode (breaks can't be finished early)

<img src="https://raw.githubusercontent.com/hovancik/stretchly/master/stretchly-settings-website-1.png" height="340">

- you can choose from different color schemes
- you can pick a sound to be played at the end of the break

<img src="https://raw.githubusercontent.com/hovancik/stretchly/master/stretchly-settings-website-2.png" height="340">

- you can set the break window to be fullscreen
- you can disable (micro)break ideas
- you can disable pre-(micro)break notifications
- you can disable monitoring of system idle time for natural breaks (when user leaves and after return idle time is greater then break duration, *stretchly* will reset breaks)
- you can disable the display of breaks on all of your monitors
- you can change the default monochrome tray icon to a colorful version
- you can change the interface language

<img src="https://raw.githubusercontent.com/hovancik/stretchly/master/stretchly-settings-website-3.png" height="340">

All settings can be reset to defaults.

### Advanced settings
All settings are saved in a JSON file. To learn more about how to find it, read [this](https://github.com/electron/electron/blob/master/docs/api/app.md#appgetpathname) or use `Ctrl/Cmd + d` shortcut in About window.
Related code looks like this:

```
const dir = app.getPath('userData')
const settingsFile = `${dir}/config.json`
```

#### Editing break/microbreak ideas
In the config file, change `useIdeasFromSettings: false,` to `useIdeasFromSettings: true,` and edit
`breakIdeas` and `microbreakIdeas`.

#### Editing break/microbreak notification interval
In the config file, change `breakNotificationInterval: 30000,` to whatever value you want. 30000 is 30 seconds. Same goes for microbreak.

#### Editing sunrise time to pause breaks until morning
In the config file you can set the `morningHour` setting to pause until that hour this or next day
Otherwise, you can set `morningHour: "sunrise"` and set `posLatitude`, `posLongitude` in
settings to pause until the actual sunrise in your area. 
E.g. if you live in Boston you would set:
`morningHour: "sunrise",`
`posLatitude: 42.3,` 
`posLongitude: 71`


#### New version notification
In the config file, set `notifyNewVersion: false,` to disable new version notification.

## Install [![Github All Releases](https://img.shields.io/github/downloads/hovancik/stretchly/total.svg)](https://github.com/hovancik/stretchly/releases/latest)

Latest installers for macOS, Windows, Linux and FreeBSD can be found [here](https://github.com/hovancik/stretchly/releases).

On macOS you can install *stretchly* by running `brew update && brew cask install stretchly`

You can create an installer by running `npm run pack` or `npm run dist` after `npm install --no-save`.

## Running from source

To run app you will need [nodejs](https://nodejs.org/). Clone the repo, run `npm install` and then simply run `npm start` to start *stretchly*.

It should run on any electron supported platform. Tested on macOS, Windows and Ubuntu Linux.

### Linux note
Please see http://electron.atom.io/docs/api/tray/ for Electron's Tray Linux specifics. Having `libappindicator1` installed should be enough for *stretchly*.
For Natural breaks, you might need some packages too (`libxss-dev`).

## Development

Feel free to join [development](https://github.com/hovancik/stretchly/blob/master/CONTRIBUTING.md) of this app via Issues and Pull Requests.
Before implementing a feature, please open an Issue first, so we can be sure that no one else is working on it and so that the changes will be accepted.

### Debugging
One can use `Ctrl/Cmd + d` shortcut in About window to show debug information:
  - location of settings file
  - time left and reference of break planner

### Known issues
- tray tooltip does not work correctly on macOS ([electron/electron#9447](https://github.com/electron/electron/issues/9447))
- fullscreen does not work on Linux ([electron/electron#11632](https://github.com/electron/electron/issues/11632))
- power monitoring not working properly ([electron/electron#8560](https://github.com/electron/electron/issues/8560))
- notifications not working on the latest Win 10 ([electron/electron#10864](https://github.com/electron/electron/issues/10864))
- tray icon is not rendered correctly on Linux ([electron/electron#12791](https://github.com/electron/electron/issues/12791))

### TODOs and Ideas
- [x] tests
- [x] PR tools
- [x] make installers/executables
- [x] create about page
- [x] only one instance
- [x] create longer breaks (5min every 30 minutes)
- [x] create settings for breaks
- [x] remember settings after restart
- [x] autostart app
- [x] start break anytime from menu
- [x] sound notification at the end of the break
- [x] strict mode (can't finish break early)
- [x] information about when will be the next break
- [x] create keyboard shortcuts
- [ ] color-picker for themes
- [ ] some kind of silent mode (see #44)
- [ ] history/timeline of breaks
- [x] localization support (l12n, gettetxt via Crowdin, Weblate or so)

### Contributors
*(by date of the first contribution)*

- Jan Hovancik, @hovancik, [hovancik.net](https://hovancik.net)
- Martina Mocinecova, (*stretchly* logo), color schemes
- Jason Barry, @JCBarry, [jcbarry.com](http://jcbarry.com)
- Alex Alekseyenko, @alexalekseyenko
- Sean Manton, @sxmanton
- Yuriy Gromchenko, @gromchen
- Mael, @laem
- Marian Dolinský, @bramborman
- midpoint, @midpoint
- stothew, @stothew
- Zhivko Kabaivanov, @unholyHub
- sergiopjf, @sergiopjf
- William Chang, @wilicw
- Purva, @purva98
- Riddhi, @riddhi99
- Fahim Dalvi, @fdalvi, [fdalvi.github.io](https://fdalvi.github.io)
- Nic Desjardins, @nicdesjardins
- Vladislav Kuznecov, @fizvlad
- Oleg V., @neooleg
- Manuel Jesús Aguilera Castro, @manueljaguilera
- Ciprian Rusen, [www.digitalcitizen.life](https://www.digitalcitizen.life)
- Carlo Gandolfi, @cgand
- Kavya Jain, @kavya-jain
- Denys Otrishko, @lundibundi
- p-bo, @p-bo
- Alina Leuca, @alinaleuca
- Sabine van der Eijk, @Sabin_E
- JavaScript Joe, [@jsjoeio](https://github.com/jsjoeio)

### Humans and Tools
 - https://github.com/typefoo/node-icns
 - https://developer.microsoft.com/en-us/microsoft-edge/tools/vms/
 - http://web.stanford.edu/dept/EHS/prod/general/ergo/microbreaks.html
 - https://www.spineuniverse.com/wellness/ergonomics/workstation-ergonomics-take-break
 - http://www.lifehack.org/articles/productivity/21-counter-intuitive-break-ideas-to-boost-your-productivity-at-work.html
 - http://www.latofonts.com/lato-free-fonts/
 - http://www.huffingtonpost.com/2012/07/24/sitting-at-work-why-its-dangerous-alternatives_n_1695618.html
 - http://www.unm.edu/~lkravitz/Article%20folder/sittingUNM.html

#### Sounds credits
Sounds used in this application are listed [here](http://freesound.org/people/hovancik/bookmarks/category/58865/).
- `crystal glass` by [mlteenie](http://freesound.org/people/mlteenie/), available under the [Attribution License](http://creativecommons.org/licenses/by/3.0/).
- `wind chime` by [GnoteSoundz](http://freesound.org/people/GnoteSoundz/), available under the [Creative Commons 0 License](http://creativecommons.org/publicdomain/zero/1.0/).
- `tic toc` by [magundah14](http://freesound.org/people/magundah14/), available under the [Creative Commons 0 License](http://creativecommons.org/publicdomain/zero/1.0/).
- `silence` by [parcodeisuoni](http://freesound.org/people/parcodeisuoni/), available under the [Attribution License](http://creativecommons.org/licenses/by/3.0/).

## License
See LICENSE file.
