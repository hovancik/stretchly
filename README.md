# Stretchly [![Humane Tech](https://raw.githubusercontent.com/engagingspaces/awesome-humane-tech/master/humane-tech-badge.svg?sanitize=true)](https://github.com/engagingspaces/awesome-humane-tech) [![Build Status](https://travis-ci.org/hovancik/stretchly.svg?branch=master)](https://travis-ci.org/hovancik/stretchly) [![Build status](https://ci.appveyor.com/api/projects/status/d3eq9bs1kcysulb1?svg=true)](https://ci.appveyor.com/project/hovancik/stretchly) [![JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/) [![codecov](https://codecov.io/gh/hovancik/stretchly/branch/master/graph/badge.svg)](https://codecov.io/gh/hovancik/stretchly) [![Join the chat at https://gitter.im/stretchly/Lobby](https://badges.gitter.im/stretchly/Lobby.svg)](https://gitter.im/stretchly/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

<img src="stretchly_128x128.png" align="right" alt="Stretchly logo">

> **The break time reminder app**

*Stretchly* is a cross-platform [Electron](https://www.electronjs.org/) app that reminds you to take breaks when working on your computer.

[![Become a Patron!](https://img.shields.io/static/v1?label=Sponsor&message=%E2%9D%A4&logo=Patreon&color=success)](https://www.patreon.com/hovancik) [![Become a Sponsor!](https://img.shields.io/static/v1?label=Sponsor&message=%E2%9D%A4&logo=GitHub&color=success)](https://github.com/sponsors/hovancik/button)

## Table of contents
- [Install](#install--)
- [Default behavior](#default-behavior)
- [Preferences](#preferences)
- [Advanced preferences](#advanced-preferences)
- [Contributor Preferences](#contributor-preferences)
- [Development](#development)
- [Known issues](#known-issues)
- [Contributors](#contributors)
- [Humans and Tools](#humans-and-tools)
- [License](#license)

## Install [![GitHub All Releases](https://img.shields.io/github/downloads/hovancik/stretchly/total)](https://github.com/hovancik/stretchly/releases) [![Packaging status](https://repology.org/badge/tiny-repos/stretchly.svg)](https://repology.org/project/stretchly/versions)

The latest official **installers** and **portable versions** for macOS, Windows, Linux and FreeBSD can be found at [Github Releases](https://github.com/hovancik/stretchly/releases) page.

### macOS

You can also install *Stretchly* with [Homebrew](https://brew.sh/) by running `brew update && brew cask install stretchly`. When upgrading, run `brew update && brew cask upgrade`

### Windows

You can install *Stretchly* for all users silently by running this as administrator: `installer.exe /S /allusers`.

You can also install *Stretchly* with [Chocolatey](https://chocolatey.org) by running the following command from the command line or from PowerShell: `choco install stretchly`. Upgrade with `choco upgrade stretchly`.

Stretchly is also available in Microsoft's [winget](https://docs.microsoft.com/en-us/windows/package-manager/winget/).

### Linux note

Please see http://electron.atom.io/docs/api/tray/ for Electron's Tray Linux specifics. Having `libappindicator1` installed should be enough for *Stretchly*.

For Natural breaks, you might need some packages too (`libxss-dev`).

If *Stretchly* is not starting, you might need to run `sudo sysctl kernel.unprivileged_userns_clone=1`. Read more [here](https://github.com/electron/electron/issues/17972). Depending on your distro, you probably want to do something similar to this, so the settings are kept after reboot: Add `kernel.unprivileged_userns_clone=1` to `/etc/sysctl.d/00-local-userns.conf` and reboot.

### Running from source

To run *Stretchly* from source you will need [Node.js](https://nodejs.org/), ideally the one specified in `package.json`. Clone the repo, run `npm install` and then simply run `npm start` to start *Stretchly*.

### Custom installer

You can create a custom installer by running `npm run pack` or `npm run dist` after `npm install --no-save`.

## Default behavior

When you run *Stretchly* for the first time, you are presented with a Welcome window that allows you to change language, review settings, view online tutorial or simply continue with the default one.

<img src="welcome.png" height="340">

*Stretchly* itself lives in your tray, only displaying a reminder window from time to time containing an idea for a break.

<img src="minibreak.png" height="340">

By default, there is a 20 seconds Mini Break every 10 minutes and 5 minutes Long Break every 30 minutes (after 2 Mini Breaks).

<img src="longbreak.png" height="340">

You'll be notified 10 seconds before Mini Break (and 30 seconds before Long Break) so that you can prepare to pause your work.

<img src="notification.png" height="90">

When Mini Break starts, you can postpone it once for 2 minutes (or 5 minutes for Long Break). Then, after a specific time interval passes, you can skip it. Both actions are available by clicking on the link at the bottom of window or by using `Ctrl/Cmd + X` keyboard shortcut.

<img src="skip.png" height="340">

Clicking on *Stretchly* icon in your tray area will show information about current status of breaks and provide menu items with extra functionality or link to the Preferences.

<img src="tray.png" height="140">

*Stretchly* is monitoring your idle time, so when you are idle for 5 minutes, breaks will be reset until you return.  

*Stretchly* is also monitoring Do Not Disturb mode, so breaks are paused when DnD mode is On.

*Stretchly* follows the theme of your system and is also available in dark mode.

<img src="dark.png" height="340">

## Preferences

Most of the preferences can be customized by clicking on "Preferences" item in tray menu.

<img src="preferences.png" height="340">

Preferences are divided into multiple categories and you are encouraged to take some time to make *Stretchly* your own by customizing them.

You can also Restore defaults to get to the default preferences state.

## Advanced preferences

All preferences are saved in a JSON file. To open it, use `Ctrl/Cmd + D` shortcut in About section of Preferences to show debug info and click on link to it.

It's recommended to Quit *Stretchly* before editing preferences file.

To make sure that all works as expected, it's always good idea to check that format of preferences file is correct, ie. by using [jsonformatter](https://jsonformatter.curiousconcept.com/).

Some of the extra settings are available in Contributor Preferences for [Contributors](#contributor-preferences). Those are marked by [![GitHub All Releases](https://img.shields.io/badge/Contributor_Prefereces-✔-success)](#contributor-preferences) badge.

**Note:** Before 1.0, Mini Breaks and Long Breaks were called Breaks and Microbreaks. To keep the upgrade smooth they still use that name in preferences file and in code.  

#### Editing Break ideas
In the preferences file, change `useIdeasFromSettings: false,` to `useIdeasFromSettings: true,` and edit `breakIdeas` and `microbreakIdeas`.

Note that when new *Stretchly* version with new break ideas is out, your custom ideas won't get updated.

#### Editing Break notification interval [![GitHub All Releases](https://img.shields.io/badge/Contributor_Prefereces-✔-success)](#contributor-preferences)

In the preferences file, change `breakNotificationInterval: 30000,` to whatever value you want. 30000 is 30 seconds. Same goes for Mini Breaks.

#### Editing sunrise time to pause breaks until morning
In the preferences file you can set the `morningHour` setting to pause until that hour this or next day
Otherwise, you can set `morningHour: "sunrise"` and set `posLatitude`, `posLongitude` in
settings to pause until the actual sunrise in your area.
E.g. if you live in Boston you would set:
`morningHour: "sunrise",`
`posLatitude: 42.3,`
`posLongitude: 71`

#### Editing postpone functionality [![GitHub All Releases](https://img.shields.io/badge/Contributor_Prefereces-✔-success)](#contributor-preferences)
In the preferences file, you can edit `microbreakPostpone` and `breakPostpone` to enable or disable ability to postopne breaks, `microbreakPostponeTime` and `breakPostponeTime` to change postopone time in milliseconds, `microbreakPostponesLimit` and `breakPostponesLimit` to change number of allowed postpones per break, and finally, `microbreakPostponableDurationPercent` and `breakPostponableDurationPercent` to change percentage of break in which user can postpone the break.

#### New version notification [![GitHub All Releases](https://img.shields.io/badge/Contributor_Prefereces-✔-success)](#contributor-preferences)
In the preferences file, set `notifyNewVersion: false,` to disable new version notification.

#### Play sound at the start of the Break [![GitHub All Releases](https://img.shields.io/badge/Contributor_Prefereces-✔-success)](#contributor-preferences)
In the preferences file, set `microbreakStartSoundPlaying: true,` to start a Mini Break with a sound (The same sounds will be played as at the end of the break). Same for `breakStartSoundPlaying`.

#### Natural breaks inactivity time [![GitHub All Releases](https://img.shields.io/badge/Contributor_Prefereces-✔-success)](#contributor-preferences)
In the preferences file, set `naturalBreaksInactivityResetTime` to your preferred value (in milliseconds, needs to be bigger than 20000ms). This is a idle time length, after which *Stretchly* timers will be cleared and waiting for user to come back.

#### Volume for break sounds [![GitHub All Releases](https://img.shields.io/badge/Contributor_Prefereces-✔-success)](#contributor-preferences)
In the preferences file, set `volume` to your preferred value. Default value is `1`, which is 100% volume. Set it, for example, to `0.61` for 61% volume.

#### Postpone/Finish Break Shortcut
In the preferences file, set `endBreakShortcut` to your preferred value. For available values for key and modifier check [Electron's documentation](https://www.electronjs.org/docs/api/accelerator) as we do not validate your value.

#### Appearance [![GitHub All Releases](https://img.shields.io/badge/Contributor_Prefereces-✔-success)](#contributor-preferences)
In the preferences file, change `themeSource: 'system'` to either `light` or `dark` to always use specified theme.  

#### Welcome window [![GitHub All Releases](https://img.shields.io/badge/Contributor_Prefereces-✔-success)](#contributor-preferences)
To show Welcome window again on next start, change `"isFirstRun"` to `true`.

## Contributor Preferences
*Stretchly* is free but you can support it by contributing code or money.

[![Become a Patron!](https://img.shields.io/static/v1?label=Sponsor&message=%E2%9D%A4&logo=Patreon&color=success)](https://www.patreon.com/hovancik) [![Become a Sponsor!](https://img.shields.io/static/v1?label=Sponsor&message=%E2%9D%A4&logo=GitHub&color=success)](https://github.com/sponsors/hovancik/button)

You will be rewarded by getting access to extra preferences available only to Contributors. You can access those after authenticating with Patreon or Github in "Love Stretchly" section of Preferences.

<img src="contributors.png" height="340">

## Development
Feel free to join [development](https://github.com/hovancik/stretchly/blob/master/CONTRIBUTING.md) of this app via Issues and Pull Requests.

**Before implementing a feature, please open an Issue first, so we can be sure that no one else is working on it and that the changes will be accepted.**

### Debugging
If you start **Stretchly** in development mode with the `npm run dev` command, it makes possible to debug the application in your browser on `http://localhost:9222`.

Also, you can use Stretchly's built-in debug shortcut by pressing `Ctrl/Cmd + D` in the About section to show information such as:
  - Location of the preferences file (Clicking on preferences file location will open it.)
  - Debug information for break planner

You can copy debug information to clipboard.

## Known issues
- users who upgraded to Windows 10 from previous versions might be in "Do not disturb mode" all the time so they need to go to the 3th settings page and uncheck "monitor Do Not Disturb mode"
- tray tooltip does not work correctly on macOS ([electron/electron#9447](https://github.com/electron/electron/issues/9447)) and Linux ([lectron/electron#15161](https://github.com/electron/electron/issues/15161))
- fullscreen does not work on Linux ([electron/electron#11632](https://github.com/electron/electron/issues/11632))
- fullscreen is not shown on all displays on Windows ([electron/electron#16907](https://github.com/electron/electron/issues/16907))
- power monitoring not working properly ([electron/electron#8560](https://github.com/electron/electron/issues/8560))
- tray icon is not rendered correctly on Linux ([electron/electron#12791](https://github.com/electron/electron/issues/12791))

## Contributors

- Jan Hovancik, @hovancik, [hovancik.net](https://hovancik.net)
- Martina Mocinecova, (pre-1.0 *Stretchly* logo), color schemes
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
- mfyz, [mfyz](https://github.com/mfyz)
- ValarMarkhulis [ValarMarkhulis](https://github.com/ValarMarkhulis)
- Lucas Costi, [@lucascosti](https://github.com/lucascosti)
- Luke Arms, [lkrms](https://github.com/lkrms)
- Chris Heyer, [@cheyer](https://github.com/cheyer)
- Sheri Richardson, [@sheriallis](https://github.com/sheriallis/)
- Felix W. Dekker, [@FWDekker](https://github.com/FWDekker)
- Balazs Nasz, [@balazsnasz](https://github.com/balazsnasz)

Also see Github's list of [contributors](https://github.com/hovancik/stretchly/graphs/contributors).

## Humans and Tools
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
This app uses [Open Sans](https://fonts.google.com/specimen/Open+Sans) fonts licensed under the [Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0).  

## License
See LICENSE file.
