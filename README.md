# Stretchly [![Awesome Humane Tech](https://raw.githubusercontent.com/humanetech-community/awesome-humane-tech/main/humane-tech-badge.svg?sanitize=true)](https://github.com/humanetech-community/awesome-humane-tech) [![Build Status](https://travis-ci.org/hovancik/stretchly.svg?branch=master)](https://travis-ci.org/hovancik/stretchly) [![Build status](https://ci.appveyor.com/api/projects/status/d3eq9bs1kcysulb1?svg=true)](https://ci.appveyor.com/project/hovancik/stretchly) [![JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/) [![codecov](https://codecov.io/gh/hovancik/stretchly/branch/master/graph/badge.svg)](https://codecov.io/gh/hovancik/stretchly) [![Join the chat at https://gitter.im/stretchly/Lobby](https://badges.gitter.im/stretchly/Lobby.svg)](https://gitter.im/stretchly/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

<img src="stretchly_128x128.png" align="right" alt="Stretchly logo">

> **The break time reminder app**

*Stretchly* is a cross-platform [Electron](https://www.electronjs.org/) app that reminds you to take breaks when working on your computer.

[![Become a Patron!](https://img.shields.io/static/v1?label=Sponsor&message=%E2%9D%A4&logo=Patreon&color=success)](https://www.patreon.com/hovancik) [![Become a Sponsor!](https://img.shields.io/static/v1?label=Sponsor&message=%E2%9D%A4&logo=GitHub&color=success)](https://github.com/sponsors/hovancik/button)

## Table of contents
- [Install](#install--)
- [Default behavior](#default-behavior)
- [Preferences](#preferences)
- [Advanced Preferences](#advanced-preferences)
- [Contributor Preferences](#contributor-preferences)
- [Development](#development)
- [Known issues](#known-issues)
- [Contributors](#contributors)
- [Humans and Tools](#humans-and-tools)
- [License](#license)

## Install [![GitHub All Releases](https://img.shields.io/github/downloads/hovancik/stretchly/total)](https://github.com/hovancik/stretchly/releases) [![Packaging status](https://repology.org/badge/tiny-repos/stretchly.svg)](https://repology.org/project/stretchly/versions)

The latest official **installers** and **portable versions** for macOS, Windows, Linux and FreeBSD can be found at [Github Releases](https://github.com/hovancik/stretchly/releases) page.

### macOS

You can also install *Stretchly* with [Homebrew](https://brew.sh/) by running `brew update && brew cask install stretchly`. When upgrading, run `brew update && brew upgrade --cask`. Don't forget to Quit Stretchly, first.

 *Stretchly* is not signed (due to its costs) so you will need to use this workaround for the first run: [Open a Mac app from an unidentified developer](https://support.apple.com/guide/mac-help/open-a-mac-app-from-an-unidentified-developer-mh40616/mac).

### Windows

You can also install *Stretchly* with [Chocolatey](https://chocolatey.org) by running the following command from the command line or from PowerShell: `choco install stretchly`. Upgrade with `choco upgrade stretchly`.

Stretchly is also available in Microsoft's [winget](https://docs.microsoft.com/en-us/windows/package-manager/winget/).

You can install *Stretchly* for all users silently by running this as administrator: `installer.exe /S /allusers`.

### Linux/BSD/Portable

For portable versions and for Linux/BSD installers, head to [Github Releases page](https://github.com/hovancik/stretchly/releases). The most widely used distributions should be covered.

#### Linux note

Please see http://electron.atom.io/docs/api/tray/ for Electron's Tray Linux specifics. Having `libappindicator1` installed should be enough for *Stretchly*.

For Natural breaks, you might need some packages too (`libxss-dev`).

If *Stretchly* is not starting, you might need to run `sudo sysctl kernel.unprivileged_userns_clone=1`. Read more [here](https://github.com/electron/electron/issues/17972). Depending on your distro, you probably want to do something similar to this, so the settings are kept after reboot: Add `kernel.unprivileged_userns_clone=1` to `/etc/sysctl.d/00-local-userns.conf` and reboot.

### Running from source

To run *Stretchly* from source you will need [Node.js](https://nodejs.org/), ideally the one specified in `package.json`. Clone the repo, run `npm install` and then simply run `npm start` to start *Stretchly*.

### Custom installer

You can create a custom installer by running `npm run pack` or `npm run dist` after `npm install --no-save`.

## Default behavior

When you run *Stretchly* for the first time, you are presented with a Welcome window that allows you to change the language, review the settings, view the online tutorial or simply continue with the default settings.

<img src="welcome.png" height="340">

*Stretchly* itself lives in your tray, only displaying a reminder window from time to time, which contains an idea for a break.

<img src="minibreak.png" height="340">

By default, there is a 20 second Mini Break every 10 minutes and a 5 minute Long Break every 30 minutes (after 2 Mini Breaks).

<img src="longbreak.png" height="340">

You'll be notified 10 seconds before a Mini Break (and 30 seconds before a Long Break) so that you can prepare to pause your work.

<img src="notification.png" height="90">

When a break starts, you can postpone it once for 2 minutes (Mini Breaks) or 5 minutes (Long Breaks). Then, after a specific time interval passes, you can skip the break. Both actions are available by clicking on the link at the bottom of window or by using the `Ctrl/Cmd + X` keyboard shortcut.

<img src="skip.png" height="340">

Clicking the *Stretchly* icon in your tray area will display the current status of breaks, provide menu items with extra functionality, and link to the Preferences.

<img src="tray.png" height="140">

*Stretchly* is monitoring your idle time, so when you are idle for 5 minutes, breaks will be paused until you return.  

*Stretchly* is also monitoring Do Not Disturb mode, so breaks are paused when DnD mode is On.

*Stretchly* follows the theme of your system and is also available in dark mode.

<img src="dark.png" height="340">

## Preferences

Most of the preferences can be customized by clicking on the "Preferences" item in the tray menu.

<img src="preferences.png" height="340">

Preferences are divided into multiple categories and you are encouraged to take some time to make *Stretchly* your own by customizing them.

You can also Restore the defaults to return to the default preferences state.

## Advanced Preferences

All preferences are saved in a JSON file. Use the `Ctrl/Cmd + D` shortcut while viewing the About section of Preferences, to show debug info and display a clickable link to the file.

It's recommended to Quit *Stretchly* before editing the preferences file.

To make sure that all works as expected, it's always good idea to check that format of the preferences file is correct, ie. by using [jsonformatter](https://jsonformatter.curiousconcept.com/).

Some of the extra settings are available in Contributor Preferences for [Contributors](#contributor-preferences). Those are marked by [![Contributor Preferences](https://img.shields.io/badge/Contributor_Preferences-✔-success)](#contributor-preferences) badge.

**Note:** Before 1.0, Mini Breaks and Long Breaks were called Microbreaks and Breaks, respectively. To keep the upgrade smooth they still use that name in preferences file and in code.  

#### Editing Break ideas
In the preferences file, change `useIdeasFromSettings: false,` to `useIdeasFromSettings: true,` and edit `breakIdeas` and `microbreakIdeas`.

Note that when a new *Stretchly* version with new break ideas is out, your custom ideas will not be overwritten.

#### Editing Break notification interval [![Contributor Preferences](https://img.shields.io/badge/Contributor_Preferences-✔-success)](#contributor-preferences)

In the preferences file, change `breakNotificationInterval: 30000,` to whatever value you want. 30000 is 30 seconds. Same goes for Mini Breaks.

#### Editing sunrise time to pause breaks until morning
In the preferences file you can set the `morningHour` setting to pause until that hour today or the next day
Otherwise, you can set `morningHour: "sunrise"` and set `posLatitude`, `posLongitude` in
settings to pause until the actual sunrise in your area.
E.g. if you live in Boston you would set:
`morningHour: "sunrise",`
`posLatitude: 42.3,`
`posLongitude: 71`

#### Editing postpone functionality [![Contributor Preferences](https://img.shields.io/badge/Contributor_Preferences-✔-success)](#contributor-preferences)
In the preferences file, you can edit `microbreakPostpone` and `breakPostpone` to enable or disable the ability to postpone breaks, `microbreakPostponeTime` and `breakPostponeTime` to change the postpone time in milliseconds, `microbreakPostponesLimit` and `breakPostponesLimit` to change the number of allowed postpones per break, and finally, `microbreakPostponableDurationPercent` and `breakPostponableDurationPercent` to change the percentage of the break during which the user can postpone it.

#### New version notification [![Contributor Preferences](https://img.shields.io/badge/Contributor_Preferences-✔-success)](#contributor-preferences)
In the preferences file, set `notifyNewVersion: false,` to disable new version notification.

#### Play sound at the start of the Break [![Contributor Preferences](https://img.shields.io/badge/Contributor_Preferences-✔-success)](#contributor-preferences)
In the preferences file, set `microbreakStartSoundPlaying: true,` to start a Mini Break with a sound (The same sound will be played as at the end of the break). Same for `breakStartSoundPlaying`.

#### Natural breaks inactivity time [![Contributor Preferences](https://img.shields.io/badge/Contributor_Preferences-✔-success)](#contributor-preferences)
In the preferences file, set `naturalBreaksInactivityResetTime` to your preferred value (in milliseconds greater than than 20000ms). This is an idle time length, after which *Stretchly* breaks will be paused until the user resumes activity.

#### Volume for break sounds [![Contributor Preferences](https://img.shields.io/badge/Contributor_Preferences-✔-success)](#contributor-preferences)
In the preferences file, set `volume` to your preferred value. Default value is `1`, which is 100% volume. Set it, for example, to `0.61` for 61% volume.

#### Postpone/Finish Break Shortcut
In the preferences file, set `endBreakShortcut` to your preferred value. We do not validate this input, so please check [Electron's documentation](https://www.electronjs.org/docs/api/accelerator) for available values for key and modifier.

#### Appearance [![Contributor Preferences](https://img.shields.io/badge/Contributor_Preferences-✔-success)](#contributor-preferences)
In the preferences file, change `themeSource: 'system'` to either `'light'` or `'dark'` to always use the specified theme.  

#### Welcome window [![Contributor Preferences](https://img.shields.io/badge/Contributor_Preferences-✔-success)](#contributor-preferences)
To show the Welcome window again on the next start, change `"isFirstRun"` to `true`.

#### Theme transparency [![Contributor Preferences](https://img.shields.io/badge/Contributor_Preferences-✔-success)](#contributor-preferences)
To specify how solid the break window should be when Theme transparency is enabled, set the value of `opacity` from `0` to `1` (which is in turn 0 to 100%).

#### Break window size [![Contributor Preferences](https://img.shields.io/badge/Contributor_Preferences-✔-success)](#contributor-preferences)
To specify the size of the break window, set the value of `breakWindowHeight` and `breakWindowWidth` from `0` to `0.99` (which is in turn 0 to 99% of the size of the screen). Don't set 100% as that's fullscreen.


## Contributor Preferences
*Stretchly* is free but you can support it by contributing code or money.

[![Become a Patron!](https://img.shields.io/static/v1?label=Sponsor&message=%E2%9D%A4&logo=Patreon&color=success)](https://www.patreon.com/hovancik) [![Become a Sponsor!](https://img.shields.io/static/v1?label=Sponsor&message=%E2%9D%A4&logo=GitHub&color=success)](https://github.com/sponsors/hovancik/button)

You will be rewarded by getting access to extra preferences (+ other perks like Preferences Sync) available only to Contributors. You can access the extra preferences after authenticating with Patreon or Github in the "Love Stretchly" section of Preferences.

<img src="contributors.png" height="340">

## Development
Feel free to join in the [development](https://github.com/hovancik/stretchly/blob/master/CONTRIBUTING.md) of this app via Issues and Pull Requests.

**Before implementing a feature, please open an Issue first, so we can be sure that no one else is working on it and that the changes will be accepted. It is important do discuss changes before implementing them (Why should we add it? How should it work? How should it look? Where will it be? ...).**

### Debugging
If you start *Stretchly* in development mode with the `npm run dev` command, it makes it possible to debug the application in your browser on `http://localhost:9222`.

Also, you can use Stretchly's built-in debug shortcut by pressing `Ctrl/Cmd + D` in the About section to show information such as:
  - Location of the preferences and log file (Clicking on file location will open it.)
  - Debug information for break planner

You can copy debug information to the clipboard.

### Logging

*Stretchly* uses `log` package for some extra logging.
Format as following:
- `System: my message` for messages regarding Operating System, ie: `System: resume or unlock`
- `Stretchly: my message` for messages regarding *Stretchly*


## Known issues
- users who upgraded to Windows 10 from previous Windows versions might be in "Do Not Disturb mode" all the time so they need to check "Show breaks even in Do Not Disturb mode"
- tray tooltip does not work correctly on macOS ([electron/electron#9447](https://github.com/electron/electron/issues/9447))
- tray tooltip does not work correctly on Linux ([electron/electron#15161](https://github.com/electron/electron/issues/15161))
- fullscreen is not shown on all displays on Windows ([electron/electron#16907](https://github.com/electron/electron/issues/16907))
- power monitoring not working properly ([electron/electron#8560](https://github.com/electron/electron/issues/8560))
- tray icon is not always rendered correctly on Linux ([electron/electron#12791](https://github.com/electron/electron/issues/12791))

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
- Daniel Bankmann, [@dbankmann](https://github.com/dbankmann)
- Aziks, [@Aziks0](https://github.com/Aziks0)
- mwoz123, [@mwoz123](https://github.com/mwoz123)
- pramit-marattha, [@pramit-marattha](https://github.com/pramit-marattha)
- Benedikt Allendorf, [@BenediktAllendorf](https://github.com/BenediktAllendorf)
- Haechan Song, [@hcsong213](https://github.com/hcsong213)

Also see Github's list of [contributors](https://github.com/hovancik/stretchly/graphs/contributors).

1.0 Icon and UI design by Colin Shanley ([www.colinshanley.com](http://www.colinshanley.com/)).

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
 - https://www.poetryfoundation.org/poems/57243/how-to-be-perfect
 - https://justworks.com/blog/improve-mental-health-work-midday-break-ideas
 - https://www.nutritiousmovement.com/dynamic-at-home-work-and-school-spaces/

#### Sounds credits
Sounds used in this application are listed [here](http://freesound.org/people/hovancik/bookmarks/category/58865/).
- `crystal glass` by [mlteenie](http://freesound.org/people/mlteenie/), available under the [Attribution License](http://creativecommons.org/licenses/by/3.0/).
- `wind chime` by [GnoteSoundz](http://freesound.org/people/GnoteSoundz/), available under the [Creative Commons 0 License](http://creativecommons.org/publicdomain/zero/1.0/).
- `tic toc` by [magundah14](http://freesound.org/people/magundah14/), available under the [Creative Commons 0 License](http://creativecommons.org/publicdomain/zero/1.0/).
- `silence` by [parcodeisuoni](http://freesound.org/people/parcodeisuoni/), available under the [Attribution License](http://creativecommons.org/licenses/by/3.0/).

#### Fonts credits
This app uses [Open Sans](https://fonts.google.com/specimen/Open+Sans) fonts licensed under the [Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0).  

## License
See [LICENSE](https://github.com/hovancik/stretchly/blob/master/LICENSE) file.
