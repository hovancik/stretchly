# Stretchly [![Humane Tech](https://raw.githubusercontent.com/engagingspaces/awesome-humane-tech/master/humane-tech-badge.svg?sanitize=true)](https://github.com/engagingspaces/awesome-humane-tech) [![Build Status](https://travis-ci.org/hovancik/stretchly.svg?branch=master)](https://travis-ci.org/hovancik/stretchly) [![Build status](https://ci.appveyor.com/api/projects/status/d3eq9bs1kcysulb1?svg=true)](https://ci.appveyor.com/project/hovancik/stretchly) [![JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/) [![codecov](https://codecov.io/gh/hovancik/stretchly/branch/master/graph/badge.svg)](https://codecov.io/gh/hovancik/stretchly) [![Join the chat at https://gitter.im/stretchly/Lobby](https://badges.gitter.im/stretchly/Lobby.svg)](https://gitter.im/stretchly/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

<img src="stretchly_128x128.png" align="right" alt="Stretchly logo">

> **The break time reminder app**

*Stretchly* est une croix-plateforme [Electron](https://www.electronjs.org/) app qui vous rappelle de prendre des pauses lorsque vous travaillez sur votre ordinateur.

[![Devenez un Patron!](https://img.shields.io/static/v1?label=Sponsor&message=%E2%9D%A4&logo=Patreon&color=success)](https://www.patreon.com/hovancik) [![Devenez Sponsor!](https://img.shields.io/static/v1?label=Sponsor&message=%E2%9D%A4&logo=GitHub&color=success)](https://github.com/sponsors/hovancik/button)

## Table des matières
- [Installer](#install--)
- [Comportement par défaut](#default-behavior)
- [Préférences](#preferences)
- [Préférences Avancées](#advanced-preferences)
- [[Préférences du contributeur](#contributor-preferences)
- [Développement](#development)
- [Problèmes connus](#known-issues)
- [Contributeurs](#contributors)
- [Humains et outils](#humans-and-tools)
- [Licence](#license)

## Installer [![GitHub Toutes Les Versions](https://img.shields.io/github/downloads/hovancik/stretchly/total)](https://github.com/hovancik/stretchly/releases)[![Emballage d'état](https://repology.org/badge/tiny-repos/stretchly.svg)](https://repology.org/project/stretchly/versions)

Les dernières versions officielles **des installateurs** et **portables * * pour macOS, Windows, Linux et FreeBSD peuvent être trouvées à [GitHub Releases] (https://github.com/hovancik/stretchly/releases) page.

### macOS

Vous pouvez également installer *Élastique* avec [Homebrew](https://brew.sh/) en exécutant `brew update && brew fût installer élastique`. Lors de la mise à niveau, exécutez `brew update && brew cask upgrade`.

* Stretchly* n'est pas signé (en raison de ses coûts), vous devrez donc utiliser cette solution de contournement pour la première exécution: [ouvrir une application Mac à partir d'une application non identifiée developer](https://support.apple.com/guide/mac-help/open-a-mac-app-from-an-unidentified-developer-mh40616/mac).

### Windows

Vous pouvez installer * Stretchy * pour tous les utilisateurs en mode silencieux en exécutant ceci en tant qu'administrateur ` ' installer.exe / s / allusers`.

Vous pouvez également installer * Stretchy * avec [Chocolatey] (https://chocolatey.org) en exécutant la commande suivante depuis la ligne de commande ou depuis PowerShell ` 'choco install stretchly'` Mise à niveau avec`choco upgrade stretchy'.

Stretch est également disponible dans [winget] de Microsoft(https://docs.microsoft.com/en-us/windows/package-manager/winget/).

### Linux note

S'il vous plaît voir http://electron.atom.io/docs/api/tray / pour l'électronique plateau Linux spécificités. Avoir 'libappindicator1' installé devrait être suffisant pour * Stretchy*.

Pour les pauses naturelles, vous pourriez avoir besoin de paquets aussi ('libxss-dev`).

Si * Stretch* ne démarre pas, vous devrez peut-être exécuter `sudo sysctl kernel.unprivileged_users_clone = 1`. Lire la suite [ici] (https://github.com/electron/electron/issues/17972). en fonction de votre distribution, vous voulez probablement faire quelque chose de similaire à cela, de sorte que les paramètres sont conservés après le redémarrage: Add ' kernel `unprivileged_userns_clone=1 " à " /etc/sysctl.d / 00-Local-userns.conf ' et redémarrer.

### Exécution à partir de la source

Pour exécuter * Stretch * à partir de la source, vous aurez besoin de [Node.js](https://nodejs.org/), idéalement celui spécifié dans ' package.json`. Cloner le repo, exécutez "npm install", puis exécutez simplement `npm start " pour démarrer *Extensible*.

### Installateur personnalisé

Vous pouvez créer un programme d'installation en exécutant `npm exécuter pack` ou `npm exécuter dist "après" npm install --no-save`.

## Comportement par défaut

Lorsque vous exécutez *Stretchly* pour la première fois, vous êtes présenté avec une fenêtre de bienvenue qui vous permet de changer la langue, revoir les paramètres, voir le tutoriel en ligne ou tout simplement continuer avec les paramètres par défaut.

<img src="welcome.png" height="340">

** Stretch * lui-même vit dans votre bac, affichant seulement une fenêtre de rappel de temps en temps, qui contient une idée pour une pause.

<img src="minibreak.png" height="340">

Par défaut, il y a une Mini pause de 20 secondes toutes les 10 minutes et une pause de 5 minutes toutes les 30 minutes (après 2 mini-pauses).

<img src="longbreak.png" height="340">

Vous serez averti 10 secondes avant une mini pause (et 30 secondes avant une longue pause) afin que vous puissiez vous préparer à mettre en pause votre travail.

<img src="notification.png" height="90">

Quand une pause commence, vous pouvez la reporter une fois pour 2 minutes (mini pauses) ou 5 minutes (longues pauses). Ensuite, après un intervalle de temps spécifique, vous pouvez sauter la pause. Les deux actions sont disponibles en cliquant sur le lien En bas de la fenêtre ou en utilisant le raccourci clavier` Ctrl/Cmd + X'.

<img src="skip.png" height="340">

En cliquant sur L'icône* Stretch * dans la zone de la barre d'état, vous afficherez l'état actuel des pauses, fournissez des fonctionnalités supplémentaires aux éléments de menu et un lien vers les préférences.

<img src="tray.png" height="140">

* Stretch * surveille votre temps d'inactivité, donc lorsque vous êtes inactif pendant 5 minutes, les pauses seront réinitialisées jusqu'à ce que vous reveniez.

* Stretch * surveille également le mode Ne pas déranger, de sorte que les pauses sont interrompues lorsque le mode MDN est activé.

* Stretchy * suit le thème de votre système et est également disponible en mode sombre.

<img src="dark.png" height="340">

## Préférence

La plupart des préférences peuvent être personnalisés en cliquant sur "Préférences" dans le menu de la barre.

<img src="preferences.png" height="340">

Les préférences sont divisées en plusieurs catégories et vous êtes encouragés à prendre le temps de faire * Stretch * votre propre en les personnalisant.

Vous pouvez également restaurer les valeurs par défaut pour revenir à l'état des préférences par défaut.

## Préférences Avancées

Toutes les préférences sont enregistrées dans un fichier JSON. Utilisez le raccourci 'Ctrl / Cmd + D' lors de l'affichage de la section À propos des préférences, pour afficher les informations de débogage et afficher un lien cliquable vers le fichier.

Il est recommandé de Quitter *Extensible* avant de modifier le fichier de préférences.

Pour vous assurer que tout fonctionne comme prévu, il est toujours bon de vérifier que le format du fichier de préférences est correct, ie. en utilisant [jsonformatter] (https://jsonformatter.curiousconcept.com/).

Certains des paramètres supplémentaires sont disponibles dans le Contributeur Préférences pour [Intervenants](#contributeur-préférences). Ceux-ci sont marqués par [![GitHub Toutes Versions](https://img.shields.io/badge/Contributor_Preferences-°-succès)](#contributeur-préférences) insigne.

** Remarque: ** Avant 1.0, les mini-pauses et les longues pauses étaient appelées micro-pauses et pauses, respectivement. Pour maintenir la mise à niveau lisse, ils utilisent toujours ce nom dans le fichier de préférences et dans le code.

#### Modification des idées de pause
Dans le fichier préférences, modifiez "utiliser les idées de paramètres: false" en "utiliser les idées de paramètres: true" et modifiez `idées de rupture " et "microbreakIdeas".

Notez que lorsqu'une nouvelle version * Stretch * avec de nouvelles idées de rupture est sortie, vos idées personnalisées ne seront pas écrasées.

#### Modification de L'intervalle de notification de pause [![GitHub Toutes Versions](https://img.shields.io/badge/Contributor_Preferences-°-succès)](#contributeur-préférences)

Dans le fichier de préférences, modifiez 'pause Notification Interval: 30000,' à la valeur que vous voulez. 30000 est 30 secondes. Il en va de même pour les mini-pauses.

#### Modification de l'heure du lever du soleil pour mettre en pause les pauses jusqu'au matin
Dans le fichier de préférences, vous pouvez définir le paramètre "heure du matin" pour mettre en pause jusqu'à cette heure aujourd'hui ou le lendemain
Sinon, vous pouvez définir `heure du matin: "lever du soleil "'et définir ' Latitude pos',` Longitude pos ' dans
paramètres de pause jusqu'au lever du soleil réel dans votre région.
E. g. si vous vivez à Boston, vous définissez:
"heure du matin: "lever du soleil",`
"Latitude pos: 42.3,`
"Longitude pos: 71`

#### Édition reporter fonctionnalité [![GitHub toutes les versions] (https://img.shields.io/badge/Contributor_Prefereces - ✔ - succès)] (#contributeur-préférences)
Dans le fichier de préférences, vous pouvez modifier `microbreakPostpone` et `breakPostpone` pour activer ou désactiver la possibilité de reporter les pauses, `microbreakPostponeTime` et `breakPostponeTime` pour modifier le délai de report en millisecondes, `microbreakPostponesLimit` et `breakPostponesLimit` pour modifier le nombre de reports autorisés par pause, et enfin, `microbreakPostponableDurationPercent` et `breakpostponabledurationpercent` pour modifier le pourcentage de la pause pendant laquelle l'utilisateur peut le reporter.

#### Nouvelle version notification [![GitHub toutes les versions] (https://img.shields.io/badge/Contributor_Prefereces - ✔ - succès)] (#contributeur-préférences)
Dans le fichier de préférences, définissez 'notifyNewVersion: false' pour désactiver la notification de nouvelle version.

#### Jouer le son Au début de la pause [![GitHub toutes les versions] (https://img.shields.io/badge/Contributor_Prefereces - ✔ - succès)] (#contributeur-préférences)
Dans le fichier de préférences, définissez 'microbreakStartSoundPlaying: true' pour démarrer une mini pause avec un son (le même son sera joué qu'à la fin de la pause). Idem pour 'breakStartSoundPlaying'.

#### Pauses naturelles temps d'inactivité [![GitHub toutes les versions] (https://img.shields.io/badge/Contributor_Prefereces - ✔ - succès)] (#contributeur-préférences)
Dans le fichier préférences, définissez 'naturalBreaksInactivityResetTime' sur votre valeur préférée (en millisecondes supérieures à 20000ms). Il s'agit d'une durée d'inactivité, après quoi les minuteries *Stretchly* seront effacées et resteront à 0 jusqu'à ce que l'utilisateur reprenne l'activité.

#### Volume pour les sons de pause [![GitHub toutes les versions] (https://img.shields.io/badge/Contributor_Prefereces - ✔ - succès)] (#contributeur-préférences)
Dans le fichier préférences, définissez ' volume` sur votre valeur préférée. La valeur par défaut est '1', soit 100% de volume. Réglez-le, par exemple, sur` 0.61 ' pour 61% de volume.

#### Reporter / Terminer Pause Raccourci
Dans le fichier préférences, définissez 'endBreakShortcut' sur votre valeur préférée. Nous ne validons pas cette entrée, veuillez donc vérifier [la documentation D'Electron] (https://www.electronjs.org/docs/api/accelerator) pour les valeurs disponibles pour la clé et le modificateur.

#### Apparence [![GitHub toutes les versions] (https://img.shields.io/badge/Contributor_Prefereces - ✔ - succès)] (#contributeur-préférences)
Dans le fichier de préférences, changez 'themeSource:' system " en "light" ou "dark" pour toujours utiliser le thème spécifié.

### Fenêtre de bienvenue [![GitHub Toutes Versions](https://img.shields.io/badge/Contributor_Preferences-°-succès)](#contributeur-préférences)
Pour afficher à nouveau la fenêtre de Bienvenue au prochain démarrage, remplacez ` "est la première exécution" ` par 'true'.

## Préférences Du Contributeur
** Stretchy * est gratuit, mais vous pouvez le soutenir en contribuant du code ou de l'argent.

[![Devenir un Patron!](https://img.shields.io/static/v1?label=Sponsor&message=%E2%9D%A4&logo=Patreon&color=success)](https://www.patreon.com/hovancik) [![Devenir un Sponsor!](https://img.shields.io/static/v1?label=Sponsor&message=%E2%9D%A4&logo=GitHub&color=success)](https://github.com/sponsors/hovancik/button)

Vous serez récompensé en ayant accès à des préférences supplémentaires (+autres avantages) disponibles uniquement pour les contributeurs. Vous pouvez accéder aux préférences supplémentaires après l'authentification avec Patreon ou Github dans la section" Love Stretchy " des préférences.

<img src="contributors.png" height="340">

## Développement
N'hésitez pas à participer au [développement] (https://github.com/hovancik/stretchy/blob/master/CONTRIBUTING.md) de cette application via les questions et les demandes de traction.

** Avant d'implémenter une fonctionnalité, veuillez d'abord ouvrir un problème, afin que nous puissions être sûrs que personne d'autre ne travaille dessus et que les modifications seront acceptées.**

### Débogage
Si vous démarrez * Stretch* en mode développement avec la commande 'npm run dev', cela permet de déboguer l'application dans votre navigateur sur `http://localhost:9222".

En outre, vous pouvez utiliser le raccourci de débogage intégré de Stretchly en appuyant sur "Ctrl / Cmd + D" dans la section À propos de pour afficher des informations telles que:
 - Emplacement du fichier de préférences (en cliquant sur l'emplacement du fichier de préférences l'ouvrira.)
 - Informations de débogage pour pause planificateur

Vous pouvez copier les informations de débogage dans le presse-papiers.

##Problèmes connus
- les utilisateurs qui ont mis à niveau vers Windows 10 à partir des versions précédentes de Windows peuvent être en mode" Ne pas déranger "tout le temps, ils doivent donc vérifier" afficher les pauses même en mode Ne pas déranger"
- l'info-bulle du bac ne fonctionne pas correctement sur macOS ([electron/electron # 9447] (https://github.com/electron/electron/issues/9447))
- l'info-bulle du bac ne fonctionne pas correctement sous Linux ([electron/electron # 15161] (https://github.com/electron/electron/issues/15161))
- le plein écran n'est pas affiché sur tous les écrans sous Windows ([electron/electron # 16907] (https://github.com/electron/electron/issues/16907))
- surveillance de puissance ne fonctionne pas correctement ([électron / électron # 8560] (https://github.com/electron/electron/issues/8560))
- l'icône de la barre d'état n'est pas toujours rendue correctement sous Linux ([electron/electron # 12791] (https://github.com/electron/electron/issues/12791))

## Contributeur

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

Voir aussi la liste des [contributeurs de Github](https://github.com/hovancik/stretchly/graphs/contributors).

## Les humains et les Outils
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

#### Sons crédits
Les sons utilisés dans cette application sont répertoriés [ici](http://freesound.org/people/hovancik/bookmarks/category/58865/).
- `crystal glass` by [mlteenie](http://freesound.org/people/mlteenie/),disponible en vertu de la  [Attribution License](http://creativecommons.org/licenses/by/3.0/).
- `wind chime` by [GnoteSoundz](http://freesound.org/people/GnoteSoundz/),disponible en vertu de la [Creative Commons 0 License](http://creativecommons.org/publicdomain/zero/1.0/).
- `tic toc` by [magundah14](http://freesound.org/people/magundah14/), disponible en vertu de la [Creative Commons 0 License](http://creativecommons.org/publicdomain/zero/1.0/).
- `silence` by [parcodeisuoni](http://freesound.org/people/parcodeisuoni/), disponible en vertu de la [Attribution License](http://creativecommons.org/licenses/by/3.0/).

#### Polices crédits
Cette application utilise [ouvrir Sans] (https://fonts.google.com/specimen/Open + sans) polices sous licence [Apache License, version 2.0](http://www.apache.org/licenses/LICENSE-2.0).

## Licence
Voir [licence] (https://github.com/hovancik/stretchy/blob/master/LICENSE) fichier.
