# Stretchly [![Humane Tech](https://raw.githubusercontent.com/engagingspaces/awesome-humane-tech/master/humane-tech-badge.svg?sanitize=true)](https://github.com/engagingspaces/awesome-humane-tech) [![Build Status](https://travis-ci.org/hovancik/stretchly.svg?branch=master)](https://travis-ci.org/hovancik/stretchly) [![Build status](https://ci.appveyor.com/api/projects/status/d3eq9bs1kcysulb1?svg=true)](https://ci.appveyor.com/project/hovancik/stretchly) [![JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/) [![codecov](https://codecov.io/gh/hovancik/stretchly/branch/master/graph/badge.svg)](https://codecov.io/gh/hovancik/stretchly) [![Join the chat at https://gitter.im/stretchly/Lobby](https://badges.gitter.im/stretchly/Lobby.svg)](https://gitter.im/stretchly/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

<img src="stretchly_128x128.png" align="right" alt="Stretchly logo">

> **Die App zur Erinnerung an die Pausenzeit**

*Stretchly* ist eine plattformübergreifende [Electron](https://www.electronjs.org/) app, die Sie daran erinnert, Pausen einzulegen, wenn Sie an Ihrem Computer arbeiten.

[![Become a Patron!](https://img.shields.io/static/v1?label=Sponsor&message=%E2%9D%A4&logo=Patreon&color=success)](https://www.patreon.com/hovancik) [![Become a Sponsor!](https://img.shields.io/static/v1?label=Sponsor&message=%E2%9D%A4&logo=GitHub&color=success)](https://github.com/sponsors/hovancik/button)

## Inhaltsverzeichnis
- [Installieren](#install--)
- [Standardverhalten](#default-behavior)
- [Einstellungen](#preferences)
- [Erweiterte Einstellungen](#advanced-preferences)
- [Einstellungen der Mitwirkenden](#contributor-preferences)
- [Entwicklung](#development)
- [Bekannte Probleme](#known-issues)
- [Mitwirkende](#contributors)
- [Menschen und Werkzeuge](#humans-and-tools)
- [Lizenz](#license)

## Installieren [![GitHub All Releases](https://img.shields.io/github/downloads/hovancik/stretchly/total)](https://github.com/hovancik/stretchly/releases) [![Packaging status](https://repology.org/badge/tiny-repos/stretchly.svg)](https://repology.org/project/stretchly/versions)

Die neuesten offiziellen **Installer** und **portablen Versionen** für MacOS, Windows, Linux und FreeBSD finden Sie unter [Github Releases](https://github.com/hovancik/stretchly/releases) Seite.

### macOS

Sie können *Stretchly* auch mit installieren [Homebrew](https://brew.sh/) durch Laufen `brew update && brew cask install stretchly`. Beim Upgrade, lauf `brew update && brew cask upgrade`.

*Stretchly* ist (aufgrund seiner Kosten) nicht signiert, daher müssen Sie diese Problemumgehung für den ersten Lauf verwenden: [Öffnen Sie eine Mac-App von einem unbekannten Entwickler](https://support.apple.com/guide/mac-help/open-a-mac-app-from-an-unidentified-developer-mh40616/mac).

### Windows

Sie können *Stretchly* für alle Benutzer unbeaufsichtigt installieren, indem Sie dies als Administrator ausführen: `installer.exe /S /allusers`.

Sie können *Stretchly* auch mit installieren [Chocolatey](https://chocolatey.org) führen Sie den folgenden Befehl über die Befehlszeile oder über PowerShell aus: `choco install stretchly`. Upgrade mit `choco upgrade stretchly`.

Stretchly ist auch in erhältlich Microsoft's [winget](https://docs.microsoft.com/en-us/windows/package-manager/winget/).

### Linux note

Bitte sehen Sie http://electron.atom.io/docs/api/tray/ zum Electron's Tray Linux besonderheiten. Haben `libappindicator1` installiert sollte ausreichen für *Stretchly*.

Zum Natural geht kaputt, möglicherweise benötigen Sie auch einige Pakete (`libxss-dev`).

Wenn *Stretchly* nicht gestartet wird, müssen Sie möglicherweise ausführen `sudo sysctl kernel.unprivileged_userns_clone=1`. Weiterlesen [here](https://github.com/electron/electron/issues/17972). Abhängig von Ihrer Distribution möchten Sie wahrscheinlich etwas Ähnliches tun, damit die Einstellungen nach dem Neustart beibehalten werden: Hinzufügen `kernel.unprivileged_userns_clone=1` zu `/etc/sysctl.d/00-local-userns.conf` und neu starten.

### Laufen von der Quelle

Um *Stretchly* von der Quelle aus auszuführen, benötigen Sie [Node.js](https://nodejs.org/), idealerweise die in `package.json`. Klonen Sie das Repo, lauf `npm install` und dann einfach laufen `npm start` anfangen *Stretchly*.

### Benutzerdefiniertes Installationsprogramm

Sie können ein benutzerdefiniertes Installationsprogramm erstellen, indem Sie es ausführen `npm run pack` oder `npm run dist` nach dem `npm install --no-save`.

## Standardverhalten

Wenn Sie *Stretchly* zum ersten Mal ausführen, wird ein Begrüßungsfenster angezeigt, in dem Sie die Sprache ändern, die Einstellungen überprüfen, das Online-Lernprogramm anzeigen oder einfach mit den Standardeinstellungen fortfahren können.

<img src="welcome.png" height="340">

*Stretchly* selbst befindet sich in Ihrem Fach und zeigt nur von Zeit zu Zeit ein Erinnerungsfenster an, das eine Idee für eine Pause enthält.

<img src="minibreak.png" height="340">

Standardmäßig gibt es alle 10 Minuten eine 20-Sekunden-Mini-Pause und alle 30 Minuten eine 5-Minuten-Pause (nach 2 Mini-Pausen).

<img src="longbreak.png" height="340">

Sie werden 10 Sekunden vor einer kurzen Pause (und 30 Sekunden vor einer langen Pause) benachrichtigt, damit Sie sich darauf vorbereiten können, Ihre Arbeit anzuhalten.

<img src="notification.png" height="90">

Wenn eine Pause beginnt, können Sie sie einmal um 2 Minuten (Mini Breaks) oder 5 Minuten (Long Breaks) verschieben. Nach Ablauf eines bestimmten Zeitintervalls können Sie die Pause überspringen. Beide Aktionen sind verfügbar, indem Sie auf den Link unten im Fenster klicken oder das verwenden`Ctrl/Cmd + X` tastaturkürzel.

<img src="skip.png" height="340">

Durch Klicken auf das Symbol *Stretchly* in Ihrem Tray-Bereich wird der aktuelle Status der Pausen angezeigt, Menüelemente mit zusätzlichen Funktionen versehen und mit den Einstellungen verknüpft.

<img src="tray.png" height="140">

*Stretchly* überwacht Ihre Leerlaufzeit. Wenn Sie also 5 Minuten im Leerlauf sind, werden die Pausen zurückgesetzt, bis Sie zurückkehren.

*Stretchly* überwacht auch den Modus „Nicht stören“, sodass Pausen angehalten werden, wenn der DnD-Modus aktiviert ist.

*Stretchly* folgt dem Thema Ihres Systems und ist auch im Dunkelmodus verfügbar.

<img src="dark.png" height="340">

## Einstellungen

Die meisten Einstellungen können durch Klicken auf den Eintrag "Einstellungen" im Taskleistenmenü angepasst werden.

<img src="preferences.png" height="340">

Die Einstellungen sind in mehrere Kategorien unterteilt. Sie sollten sich etwas Zeit nehmen, um *Stretchly* zu Ihren eigenen zu machen, indem Sie sie anpassen.

Sie können auch die Standardeinstellungen wiederherstellen, um zum Standardeinstellungsstatus zurückzukehren.

## Erweiterte Einstellungen

Alle Einstellungen werden in einer JSON-Datei gespeichert. Verwenden Sie die `Ctrl/Cmd + D` verknüpfung beim Anzeigen des Abschnitts "Info" in den Einstellungen, um Debug-Informationen anzuzeigen und einen anklickbaren Link zur Datei anzuzeigen.

Es wird empfohlen, *Stretchly* zu beenden, bevor Sie die Einstellungsdatei bearbeiten.

Um sicherzustellen, dass alles wie erwartet funktioniert, ist es immer eine gute Idee, zu überprüfen, ob das Format der Voreinstellungsdatei korrekt ist, d. H. durch die Nutzung [jsonformatter](https://jsonformatter.curiousconcept.com/).

Einige der zusätzlichen Einstellungen sind in den Contributor-Einstellungen für verfügbar [Mitwirkende](#contributor-preferences). Diese sind gekennzeichnet durch [![GitHub Alle Releases](https://img.shields.io/badge/Contributor_Prefereces-✔-success)](#contributor-preferences) abzeichen.

**Hinweis:** Vor 1.0, Mini Breaks und Long Breaks wurden als Microbreaks bzw. Breaks bezeichnet. Um das Upgrade reibungslos zu gestalten, wird dieser Name weiterhin in der Einstellungsdatei und im Code verwendet. 

#### Break-Ideen bearbeiten
Ändern Sie in der Voreinstellungsdatei `useIdeasFromSettings: false,` zu `useIdeasFromSettings: true,` und bearbeiten `breakIdeas` und `microbreakIdeas`.

Beachten Sie, dass Ihre benutzerdefinierten Ideen nicht überschrieben werden, wenn eine neue * Stretchly * -Version mit neuen Unterbrechungsideen herauskommt.

#### Bearbeiten des Pausenbenachrichtigungsintervalls [![GitHub Alle Releases](https://img.shields.io/badge/Contributor_Prefereces-✔-success)](#contributor-preferences)

In der Voreinstellungsdatei, Veränderung `breakNotificationInterval: 30000,` zu welchem Wert Sie wollen. 30000 ist 30 sekunden. Gleiches gilt für Mini Breaks.

#### Bearbeiten der Sonnenaufgangszeit, um die Pausen bis zum Morgen anzuhalten
In der Voreinstellungsdatei können Sie die festlegen `morningHour` einstellung, um bis zu dieser Stunde heute oder am nächsten Tag zu pausieren
Ansonsten können Sie einstellen `morningHour: "sunrise"` und setzen `posLatitude`, `posLongitude` in den Einstellungen bis zum tatsächlichen Sonnenaufgang in Ihrer Nähe zu pausieren.
Z.B. Wenn Sie in Boston leben, würden Sie festlegen:
`morningHour: "sunrise",`
`posLatitude: 42.3,`
`posLongitude: 71`

#### Bearbeiten der Verschiebungsfunktion [![GitHub Alle Releases](https://img.shields.io/badge/Contributor_Prefereces-✔-success)](#contributor-preferences)
In der Voreinstellungsdatei können Sie bearbeiten `microbreakPostpone` und `breakPostpone` aktivieren oder Deaktivieren der Möglichkeit, Pausen zu verschieben, `microbreakPostponeTime` und `breakPostponeTime` um die Verschiebungszeit in Millisekunden zu ändern, `microbreakPostponesLimit` und `breakPostponesLimit` um die Anzahl der zulässigen Verschiebungen pro Pause zu ändern, und schlussendlich, `microbreakPostponableDurationPercent` und `breakPostponableDurationPercent` um den Prozentsatz der Pause zu ändern, während der der Benutzer sie verschieben kann.

#### Benachrichtigung über neue Version [![GitHub Alle Releases](https://img.shields.io/badge/Contributor_Prefereces-✔-success)](#contributor-preferences)
In der Voreinstellungsdatei, einstellen `notifyNewVersion: false,` um die Benachrichtigung über neue Versionen zu deaktivieren.

#### Spielen Sie den Sound zu Beginn der Pause ab[![GitHub Alle Releases](https://img.shields.io/badge/Contributor_Prefereces-✔-success)](#contributor-preferences)
In der Voreinstellungsdatei, einstellen `microbreakStartSoundPlaying: true,` um eine Mini-Pause mit einem Sound zu starten (Es wird der gleiche Sound wie am Ende der Pause abgespielt). Gleiches gilt für `breakStartSoundPlaying`.

#### Natürliche Pausen Inaktivitätszeit [![GitHub Alle Releases](https://img.shields.io/badge/Contributor_Prefereces-✔-success)](#contributor-preferences)
In der Voreinstellungsdatei, einstellen `naturalBreaksInactivityResetTime` zu Ihrem bevorzugten Wert (in Millisekunden größer als 20000ms). Dies ist eine Leerlaufzeit, nach der *Stretchly* die Timer werden gelöscht und bleiben bei 0, bis der Benutzer die Aktivität wieder aufnimmt.

#### Lautstärke für Pausengeräusche [![GitHub Alle Releases](https://img.shields.io/badge/Contributor_Prefereces-✔-success)](#contributor-preferences)
In der Voreinstellungsdatei, einstellen `volume` zu Ihrem bevorzugten Wert. Standardwert ist `1`, welches ist 100% volumen. Stell es ein, beispielsweise, zu `0.61` zum 61% volumen.

#### Verknüpfung zum Verschieben / Beenden der Unterbrechung
In der Voreinstellungsdatei, einstellen `endBreakShortcut` zu Ihrem bevorzugten Wert. Wir validieren diese Eingabe nicht, also bitte überprüfen [Electron's documentation](https://www.electronjs.org/docs/api/accelerator) für verfügbare Werte für Schlüssel und Modifikator.

#### Aussehen [![GitHub Alle Releases](https://img.shields.io/badge/Contributor_Prefereces-✔-success)](#contributor-preferences)
In der Voreinstellungsdatei, Veränderung `themeSource: 'system'` entweder `'light'` oder `'dark'` um immer das angegebene Thema zu verwenden. 

#### Willkommensfenster [![GitHub Alle Releases](https://img.shields.io/badge/Contributor_Prefereces-✔-success)](#contributor-preferences)
Um das Begrüßungsfenster beim nächsten Start erneut anzuzeigen, veränderung `"isFirstRun"` zu `true`.

## Einstellungen der Mitwirkenden
*Stretchly* ist kostenlos, aber Sie können es unterstützen, indem Sie Code oder Geld beisteuern.

[![Become a Patron!](https://img.shields.io/static/v1?label=Sponsor&message=%E2%9D%A4&logo=Patreon&color=success)](https://www.patreon.com/hovancik) [![Become a Sponsor!](https://img.shields.io/static/v1?label=Sponsor&message=%E2%9D%A4&logo=GitHub&color=success)](https://github.com/sponsors/hovancik/button)

Sie werden belohnt, indem Sie Zugriff auf zusätzliche Einstellungen (+ andere Vergünstigungen) erhalten, die nur Mitwirkenden zur Verfügung stehen. Sie können auf die zusätzlichen Einstellungen zugreifen, nachdem Sie sich bei Patreon oder Github im Internet authentifiziert haben "Love Stretchly" abschnitt der Einstellungen.

<img src="contributors.png" height="340">

## Entwicklung
Fühlen Sie sich frei, an der teilzunehmen [Entwicklung](https://github.com/hovancik/stretchly/blob/master/CONTRIBUTING.md) dieser App über Issues und Pull Requests.

**Bevor Sie eine Funktion implementieren, öffnen Sie bitte zuerst ein Problem, damit wir sicher sein können, dass niemand anderes daran arbeitet und die Änderungen akzeptiert werden.**

### Debuggen
Wenn du anfängst *Stretchly* im Entwicklungsmodus mit dem `npm run dev` befehl, es ermöglicht das Debuggen der Anwendung in Ihrem Browser auf `http://localhost:9222`.

Ebenfalls, sie können die integrierte Debug-Verknüpfung von Stretchly verwenden, indem Sie auf drücken `Ctrl/Cmd + D` im Abschnitt "Info", um Informationen anzuzeigen wie:
  - Speicherort der Voreinstellungsdatei (Durch Klicken auf den Speicherort der Voreinstellungsdatei wird diese geöffnet.)
  - Debug-Informationen für den Pausenplaner
  
Sie können Debug-Informationen in die Zwischenablage kopieren.

## Bekannte Probleme
- Benutzer, die von früheren Windows-Versionen auf Windows 10 aktualisiert haben, befinden sich möglicherweise ständig im Modus "Nicht stören". Daher müssen sie "Break-Even im Modus" Nicht stören "anzeigen" aktivieren.
- Der Tooltip für das Fach funktioniert nicht ordnungsgemäß macOS ([electron/electron#9447](https://github.com/electron/electron/issues/9447))
- Der Tooltip für das Fach funktioniert nicht ordnungsgemäß Linux ([electron/electron#15161](https://github.com/electron/electron/issues/15161))
- Vollbild wird nicht auf allen Displays angezeigt Windows ([electron/electron#16907](https://github.com/electron/electron/issues/16907))
- Leistungsüberwachung funktioniert nicht richtig ([electron/electron#8560](https://github.com/electron/electron/issues/8560))
- Das Tray-Symbol wird auf nicht immer korrekt gerendert Linux ([electron/electron#12791](https://github.com/electron/electron/issues/12791))

## Mitwirkende

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

Siehe auch Githubs Liste von [Mitwirkende](https://github.com/hovancik/stretchly/graphs/contributors).

1.0 Symbol- und UI-Design von Colin Shanley ([www.colinshanley.com](http://www.colinshanley.com/)).

## Menschen und Werkzeuge
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

#### Klingt nach Credits
In dieser Anwendung verwendete Sounds werden aufgelistet [here](http://freesound.org/people/hovancik/bookmarks/category/58865/).
- `crystal glass` by [mlteenie](http://freesound.org/people/mlteenie/), verfügbar unter der [Attribution License](http://creativecommons.org/licenses/by/3.0/).
- `wind chime` by [GnoteSoundz](http://freesound.org/people/GnoteSoundz/), verfügbar unter der [Creative Commons 0 License](http://creativecommons.org/publicdomain/zero/1.0/).
- `tic toc` by [magundah14](http://freesound.org/people/magundah14/), verfügbar unter der [Creative Commons 0 License](http://creativecommons.org/publicdomain/zero/1.0/).
- `silence` by [parcodeisuoni](http://freesound.org/people/parcodeisuoni/), verfügbar unter der [Attribution License](http://creativecommons.org/licenses/by/3.0/).

#### Credits für Schriftarten
Diese App verwendet [Open Sans](https://fonts.google.com/specimen/Open+Sans) schriftarten lizenziert unter der [Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0).  

## Lizenz
sehen [LICENSE](https://github.com/hovancik/stretchly/blob/master/LICENSE) datei.
