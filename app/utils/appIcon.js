const TrayWithText = require("./trayWithText");
// Get path of correct app icon based on different criteria
const path = require("path");

class AppIcon {
  constructor({
    platform,
    paused,
    monochrome,
    inverted,
    darkMode,
    remainingModeString,
    remainingTimeString,
    totalLongBreak
  }) {
    this.platform = platform;
    this.paused = paused;
    this.monochrome = monochrome;
    this.inverted = inverted;
    this.darkMode = darkMode;
    this.remainingModeString = remainingModeString;
    this.remainingTimeString = remainingTimeString;
    this.totalLongBreak = totalLongBreak; //required only for circular timer
  }

  get trayIconFileName() {
    const pausedString = this.paused ? "Paused" : "";
    const invertedMonochromeString = this.inverted ? "Inverted" : "";
    const darkModeString = this.darkMode ? "Dark" : "";
    const monochrome = this.monochrome ? "Monochrome" : "";

    console.log(this.remainingModeString);
    if (this.remainingModeString == "") {
      if (this.monochrome) {
        if (this.platform === "darwin") {
          return `trayMacMonochrome${pausedString}Template.png`;
        } else {
          return `trayMonochrome${invertedMonochromeString}${pausedString}.png`;
        }
      } else {
        if (this.platform === "darwin") {
          return `trayMac${pausedString}${darkModeString}.png`;
        } else {
          return `tray${pausedString}${darkModeString}.png`;
        }
      }
    } else if (this.remainingModeString == "Number") {
      let textGen = new TrayWithText();
      let minRemain = parseInt(this.remainingTimeString);
      let returnVal = textGen.iconWithNumber(
        "/numbers/generated-numbers/",
        minRemain,
        darkModeString,
        monochrome,
        this.platform,
        invertedMonochromeString
      );
      return returnVal;
    } else { //Circle
      let textGen = new TrayWithText();
      let minRemain = parseInt(this.remainingTimeString);
      let returnVal = textGen.pathWithCircularIcon(
        "/round-clock/",
        minRemain,
        this.totalLongBreak,
        darkModeString,
        monochrome,
        this.platform,
        invertedMonochromeString
      );
      return returnVal;
    }
  }

  pictureCombines = async function (
    defaultIconPath,
    pathToImages,
    nameOfImage
  ) {
    try {
      let img = await mergeImg([
        {src: defaultIconPath},
        {
          src: pathToImages + nameOfImage + ".png",
          offsetX: -32,
        },
      ]);
      await img.write(pathToImages + iconTrayFilename, () => log.debug("done"));
    } catch (e) {
      log.debug("safely ignored error");
    }
  };

  get windowIconFileName() {
    const invertedMonochromeString = this.inverted ? "Inverted" : "";
    const darkModeString = this.darkMode ? "Dark" : "";

    if (this.monochrome) {
      return `trayMonochrome${invertedMonochromeString}.png`;
    } else {
      return `tray${darkModeString}.png`;
    }
  }
}

module.exports = AppIcon;
