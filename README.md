# stretchly [![Humane Tech](https://raw.githubusercontent.com/engagingspaces/awesome-humane-tech/master/humane-tech-badge.svg?sanitize=true)](https://github.com/engagingspaces/awesome-humane-tech) [![Build Status](https://travis-ci.org/hovancik/stretchly.svg?branch=master)](https://travis-ci.org/hovancik/stretchly) [![Build status](https://ci.appveyor.com/api/projects/status/d3eq9bs1kcysulb1?svg=true)](https://ci.appveyor.com/project/hovancik/stretchly) [![JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/) [![codecov](https://codecov.io/gh/hovancik/stretchly/branch/master/graph/badge.svg)](https://codecov.io/gh/hovancik/stretchly) [![Join the chat at https://gitter.im/stretchly/Lobby](https://badges.gitter.im/stretchly/Lobby.svg)](https://gitter.im/stretchly/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

<img src="https://raw.githubusercontent.com/hovancik/stretchly/master/stretchly_128x128.png" align="right">

> break time reminder app

*stretchly* is a cross-platform [electron](http://electron.atom.io/) app that reminds you to take breaks when working on your computer.

[![Become a Patron!](https://c5.patreon.com/external/logo/become_a_patron_button.png)](https://www.patreon.com/hovancik)

By default, it runs in your tray and displays a reminder window containing an idea for a microbreak for 20 seconds every 10 minutes.

<img src="https://raw.githubusercontent.com/hovancik/stretchly/master/stretchly-microbreak.png" height="340">

Every 30 minutes, it displays a window containing an idea for a longer 5 minute break.

<img src="https://raw.githubusercontent.com/hovancik/stretchly/master/stretchly-break.png" height="340">

User gets notified 30 seconds before break (and 10 seconds before microbreak) to be able to prepare to pause the work.

<img src="https://raw.githubusercontent.com/hovancik/stretchly/master/stretchly-notification.png" height="90">

When break/microbreak starts, you can postpone it once for 5 and 2 minutes respectively. After a specific time interval passes, you can finish it early.

Both actions are available by clicking the link at the bottom of window
or by using `Ctrl/Cmd + x` keyboard shortcut (except finishing early in strict mode).

You can pause/resume *stretchly*'s break reminders. On Windows and macOS, you can set the app to start at login. Also, Do Not Disturb mode is respected on those platforms.

<img src="https://raw.githubusercontent.com/hovancik/stretchly/master/stretchly-tray-1.png" height="150">

You can also skip to the next break or microbreak anytime from the menu, or reset (restart) breaks.

<img src="https://raw.githubusercontent.com/hovancik/stretchly/master/stretchly-tray-2.png" height="150">

The tray tooltip shows information about how much time is left till the next (micro)break, the number of microbreaks until the next break, or the time remaining in pause till breaks resume.

<img src="https://raw.githubusercontent.com/hovancik/stretchly/master/stretchly-tray-3.png" height="90">

Tray menu displays the time and type of next break as well.

Microbreaks and breaks can be customized:
- you can set the duration and interval of breaks
- you can enable/disable breaks
- you can enable/disable strict mode (breaks can't be finished early)
- you can enable/disable ability to postpone breaks

<img src="https://raw.githubusercontent.com/hovancik/stretchly/master/stretchly-settings-website-1.png" height="340">

- you can choose from different color schemes
- you can pick a sound to be played at the end of the break

<img src="https://raw.githubusercontent.com/hovancik/stretchly/master/stretchly-settings-website-2.png" height="340">

- you can set the break window to be fullscreen
- you can disable (micro)break ideas
- you can disable pre-(micro)break notifications
- you can disable notification sounds
- you can disable monitoring of system idle time for natural breaks (when user leaves and after return idle time is greater then break duration, *stretchly* will reset breaks)
- you can disable monitoring of DND (Do Not Disturb) mode on MacOS and Windows (breaks are not shown in DND mode)
- you can disable the display of breaks on all of your monitors
- you can change the default monochrome tray icon to a colorful version
- you can change the interface language

<img src="https://raw.githubusercontent.com/hovancik/stretchly/master/stretchly-settings-website-3.png" height="340">

All settings can be reset to defaults.

On first run, stretchly will present you with Welcome window, where you can set your locale and read Tutorial.

<img src="https://raw.githubusercontent.com/hovancik/stretchly/master/stretchly-welcome.png" height="340">

You can view Tutorial again anytime from About window.

### Advanced settings
All settings are saved in a JSON file. To open it, use `Ctrl/Cmd + d` shortcut in About window and click on link to it.

#### Editing break/microbreak ideas
In the settings file, change `useIdeasFromSettings: false,` to `useIdeasFromSettings: true,` and edit
`breakIdeas` and `microbreakIdeas`.

#### Editing break/microbreak notification interval
In the settings file, change `breakNotificationInterval: 30000,` to whatever value you want. 30000 is 30 seconds. Same goes for microbreak.

#### Editing sunrise time to pause breaks until morning
In the settings file you can set the `morningHour` setting to pause until that hour this or next day
Otherwise, you can set `morningHour: "sunrise"` and set `posLatitude`, `posLongitude` in
settings to pause until the actual sunrise in your area.
E.g. if you live in Boston you would set:
`morningHour: "sunrise",`
`posLatitude: 42.3,`
`posLongitude: 71`

#### Editing postpone functionality
In the settings file, you can edit `microbreakPostpone` and `breakPostpone` to enable or disable ability to postopne breaks, `microbreakPostponeTime` and `breakPostponeTime` to change postopone time in milliseconds, `microbreakPostponesLimit` and `breakPostponesLimit` to change number of allowed postpones per break, and finally, `microbreakPostponableDurationPercent` and `breakPostponableDurationPercent` to change percentage of break in which user can postpone the break.

#### New version notification
In the settings file, set `notifyNewVersion: false,` to disable new version notification.

#### Play sound at the start of the micro/break
In the settings file, set `microbreakStartSoundPlaying: true,` to start a microbreak with a sound. Same for `breakStartSoundPlaying`.

#### Fit screen for non-full screen break windows
In the settings file, change `fitscreen: false,` to `fitscreen: true,`. This will make break windows to render to fill/fit the screen(s) instead of 800x600 windows.

## Install [![Github All Releases](https://img.shields.io/github/downloads/hovancik/stretchly/total.svg)](https://github.com/hovancik/stretchly/releases/latest)

Latest installers for macOS, Windows, Linux and FreeBSD can be found [here](https://github.com/hovancik/stretchly/releases).

On macOS you can install *stretchly* by running `brew update && brew cask install stretchly`.

On Windows, you can install *stretchly* for all users silently by running this as administrator: `installer.exe /S /allusers`.

You can create an installer by running `npm run pack` or `npm run dist` after `npm install --no-save`.

## Running from source

To run app you will need [nodejs](https://nodejs.org/). Clone the repo, run `npm install` and then simply run `npm start` to start *stretchly*.

It should run on any electron supported platform. Tested on macOS, Windows and Ubuntu Linux.

### Linux note
Please see http://electron.atom.io/docs/api/tray/ for Electron's Tray Linux specifics. Having `libappindicator1` installed should be enough for *stretchly*.

For Natural breaks, you might need some packages too (`libxss-dev`).

If *stretchly* is not starting, you might need to run `sudo sysctl kernel.unprivileged_userns_clone=1`. Read more [here](https://github.com/electron/electron/issues/17972). Depending on your distro, you probably want to do something similar to this, so the settings are kept after reboot: Add `kernel.unprivileged_userns_clone=1` to `/etc/sysctl.d/00-local-userns.conf` and reboot.

## Development

Feel free to join [development](https://github.com/hovancik/stretchly/blob/master/CONTRIBUTING.md) of this app via Issues and Pull Requests.
Before implementing a feature, please open an Issue first, so we can be sure that no one else is working on it and so that the changes will be accepted.

### Debugging
One can use `Ctrl/Cmd + d` shortcut in About window to show debug information:
  - location of settings file (Clicking on settings file location will open it.)
  - debug information for break planner

You can copy debug information to clipboard.

### Known issues
- users who upgraded to Windows 10 from previous versions might be in "Do not disturb mode" all the time so they need to go to the 3th settings page and uncheck "monitor Do Not Disturb mode"
- tray tooltip does not work correctly on macOS ([electron/electron#9447](https://github.com/electron/electron/issues/9447)) and Linux ([lectron/electron#15161](https://github.com/electron/electron/issues/15161))
- fullscreen does not work on Linux ([electron/electron#11632](https://github.com/electron/electron/issues/11632))
- fullscreen is not shown on all displays on Windows ([electron/electron#16907](https://github.com/electron/electron/issues/16907))
- power monitoring not working properly ([electron/electron#8560](https://github.com/electron/electron/issues/8560))
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
- [x] some kind of silent mode (see #44 and #327)
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
- Ismail Demirbilek, [@dbtek](https://github.com/dbtek)
- Giacomo Rossetto, [@jackymancs4](https://github.com/jackymancs4)
- Hum4n01d, [@hum4n01d](https://github.com/hum4n01d)
- Ary Borenszweig, [@asterite](https://github.com/asterite)
- Jonatan Nyberg, @jony0008
- Gowee [@Gowee](https://github.com/Gowee)
- William Lin, [@FanciestW](https://github.com/FanciestW)
- Hisman Yosika, [@dnjstlr555](https://github.com/dnjstlr555)
- Mehmet Fatih Yıldız, [@mfyz](https://github.com/mfyz)
- Sunny Dhoke, [@sunn-e](https://github.com/sunn-e)
- Przemysław Rząd, [@rzadp](https://github.com/rzadp)
- Artūras Stifanovičius, [@troyanas](https://github.com/troyanas)
- pan93412, [@pan93412](https://github.com/pan93412)
- robot-5, [robot-5](https://github.com/robot-5)

### Humans and Tools
 - https://www.icoconverter.com/ to generate .ico
 - http://www.img2icnsapp.com/ to create .icns
 - https://developer.microsoft.com/en-us/microsoft-edge/tools/vms/
 - http://web.stanford.edu/dept/EHS/prod/general/ergo/microbreaks.html
 - https://www.spineuniverse.com/wellness/ergonomics/workstation-ergonomics-take-break
 - http://www.lifehack.org/articles/productivity/21-counter-intuitive-break-ideas-to-boost-your-productivity-at-work.html
 - http://www.latofonts.com/lato-free-fonts/
 - http://www.huffingtonpost.com/2012/07/24/sitting-at-work-why-its-dangerous-alternatives_n_1695618.html
 - http://www.unm.edu/~lkravitz/Article%20folder/sittingUNM.html
 - https://www.ninds.nih.gov/News-Events/News-and-Press-Releases/Press-Releases/Want-learn-new-skill-Take-some-short-breaks
 - https://www.painscience.com/articles/chair-trouble.php
 - https://www.painscience.com/articles/microbreaking.php
 - https://github.com/CognirelTech/Quillpad-Server
 - https://www.webmd.com/fitness-exercise/a-z/seven-minute-workout
#### Sounds credits
Sounds used in this application are listed [here](http://freesound.org/people/hovancik/bookmarks/category/58865/).
- `crystal glass` by [mlteenie](http://freesound.org/people/mlteenie/), available under the [Attribution License](http://creativecommons.org/licenses/by/3.0/).
- `wind chime` by [GnoteSoundz](http://freesound.org/people/GnoteSoundz/), available under the [Creative Commons 0 License](http://creativecommons.org/publicdomain/zero/1.0/).
- `tic toc` by [magundah14](http://freesound.org/people/magundah14/), available under the [Creative Commons 0 License](http://creativecommons.org/publicdomain/zero/1.0/).
- `silence` by [parcodeisuoni](http://freesound.org/people/parcodeisuoni/), available under the [Attribution License](http://creativecommons.org/licenses/by/3.0/).

#### Fonts credits
This app uses [Lato](https://www.latofonts.com) fonts under the OFL license. See OFL.txt file.  

## License
See LICENSE file.
