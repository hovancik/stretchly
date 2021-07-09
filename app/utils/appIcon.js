const TrayWithText2 = require("./trayWithText2");
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
  }) {
    this.platform = platform;
    this.paused = paused;
    this.monochrome = monochrome;
    this.inverted = inverted;
    this.darkMode = darkMode;
    this.remainingModeString = remainingModeString;
    this.remainingTimeString = remainingTimeString;
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
    } else if (this.remainingModeString == "number") {
      console.log("tick");
      let textGen = new TrayWithText2();
      let minRemain = parseInt(this.remainingTimeString);
      let returnVal = textGen.showWithNumber(
        "/numbers/generated-numbers/",
        minRemain,
        darkModeString,
        monochrome,
        this.platform,
        invertedMonochromeString
      );

      console.log(returnVal);
      return returnVal;
      // return `tray${pausedString}${darkModeString}.png`;
    } else {
      //circle
      return `tray${pausedString}${darkModeString}.png`;
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
