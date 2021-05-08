const {Tray} = require("electron");
const mergeImg = require("merge-img");
const pathToImages = "app/images/app-icons/numbers/";
const log = require("electron-log");

class TrayWithText extends Tray {
  showWithNumber = async function (imagePath, minutesToLongBreak) {
    let minutesOnTray = "00";
    if (minutesToLongBreak < 10) {
      minutesOnTray = "0" + minutesToLongBreak;
      try {
        let img = await mergeImg([
          {src: imagePath},
          {
            src: pathToImages + minutesOnTray + ".png",
            offsetX: -32,
          },
        ]);
        await img.write(pathToImages + "out.png", () => log.debug("done"));
      } catch (e) {
        log.debug("safely ignored error");
      }
    } else {
      let lastDigit = minutesToLongBreak % 10;
      minutesOnTray = Math.floor((minutesToLongBreak / 10) % 10);
      try {
        let img = await mergeImg([
          {src: pathToImages + minutesOnTray + ".png"},
          {
            src: pathToImages + lastDigit + ".png",
          },
        ]);
        await img.write(pathToImages + "twoDigitNumber.png");

        let img2 = await mergeImg([
          {src: imagePath},
          {
            src: pathToImages + "twoDigitNumber.png",
            offsetX: -32,
          },
        ]);
        await img2.write(pathToImages + "out.png", () => log.debug("done"));
      } catch (e) {
        log.debug("safely ignored error");
      }
    }
  };
}

module.exports = TrayWithText;
