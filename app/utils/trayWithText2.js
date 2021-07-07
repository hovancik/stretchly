// const {Tray} = require('electron');
const mergeImg = require('merge-img-vwv');
const pathToImages = "app/images/app-icons/numbers/generated-numbers/";
const pathToImages2 = "numbers/generated-numbers/";
const pathToCircleImages = "app/images/app-icons/round-clock/";
const log = require('electron-log');
const iconTrayFilename = 'trayIcon.png';
const baseImages = 'app/images/app-icons/numbers/';

class TrayWithText2 {
  // setTrayWhenNeeded = async function (
  //   trayPath,
  //   minutes,
  //   showTrayIcon,
  //   breakIconType,
  //   minutesLongBreakTake
  // ) {
  //   if (showTrayIcon && breakIconType == "number") {
  //     this.showWithNumber(trayPath, minutes);
  //     this.setImage(pathToImages + iconTrayFilename);
  //   } else if (showTrayIcon && breakIconType == "circleIcon") {
  //     this.showWithCircle(trayPath, minutes, minutesLongBreakTake);
  //     this.setImage(pathToCircleImages + iconTrayFilename);
  //   } else {
  //     this.setImage(trayPath);
  //   }
  // };

  showWithCircle = async function (
    imagePath,
    minutesToLongBreak,
    totalLongBreak
  ) {
    let minutesOnTray = minutesToLongBreak;
    let timeLeftRatio = minutesOnTray / totalLongBreak;
    if (timeLeftRatio >= 0.875) {
      await this.pictureCombines(imagePath, pathToCircleImages, "0");
    } else if (timeLeftRatio < 0.875 && timeLeftRatio > 0.75) {
      await this.pictureCombines(imagePath, pathToCircleImages, "7");
    } else if (timeLeftRatio <= 0.75 && timeLeftRatio > 0.625) {
      await this.pictureCombines(imagePath, pathToCircleImages, "15");
    } else if (timeLeftRatio <= 0.625 && timeLeftRatio > 0.5) {
      await this.pictureCombines(imagePath, pathToCircleImages, "22");
    } else if (timeLeftRatio <= 0.5 && timeLeftRatio > 0.375) {
      await this.pictureCombines(imagePath, pathToCircleImages, "30");
    } else if (timeLeftRatio <= 0.375 && timeLeftRatio > 0.25) {
      await this.pictureCombines(imagePath, pathToCircleImages, "37");
    } else if (timeLeftRatio <= 0.25 && timeLeftRatio > 0.125) {
      await this.pictureCombines(imagePath, pathToCircleImages, "45");
    } else if (timeLeftRatio <= 0.125 && timeLeftRatio > 0.065) {
      await this.pictureCombines(imagePath, pathToCircleImages, "52");
    } else {
      await this.pictureCombines(imagePath, pathToCircleImages, "60");
    }
  };

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

  storeNewNumber = async function (imagePath, minutesToLongBreak) {
    let minutesOnTray = minutesToLongBreak;
    if (minutesToLongBreak < 10) {
      minutesOnTray = "0" + minutesToLongBreak;
    }
    try {
      let img = await mergeImg([
        {src: imagePath},
        {
          src: pathToImages + minutesOnTray + ".png",
          offsetX: -32,
        },
      ]);
      await img.write(pathToImages + iconTrayFilename, () => {
        log.debug("doneImageUpdate");
        return true;
        // return pathToImages + iconTrayFilename;
      });
      // return pathToImages + iconTrayFilename;
    } catch (e) {
      log.debug("safely ignored error");
    }
  };

  showWithNumber = function (imagePath, 
    minutesToLongBreak,
    darkModeString, 
    monochrome, platform,invertedMonochromeString
    ) {
    let minutesOnTray = minutesToLongBreak;
    if (minutesToLongBreak < 10) {
      minutesOnTray = '0' + minutesToLongBreak;
    }
        if (monochrome) {
            if (platform === "darwin") {
              return `${imagePath}traytMacMonochrome${minutesOnTray}.png`;
            } else {
              return `${imagePath}trayMonochrome${invertedMonochromeString}${minutesOnTray}.png`;
            }
          } else {
            if (platform === "darwin") {
              return `${imagePath}traytMac${darkModeString}${minutesOnTray}.png`;
            } else {
              return `${imagePath}trayt${darkModeString}${minutesOnTray}.png`;
            }
          }
    // return imagePath + `trayt${darkModeString}` + minutesOnTray + ".png";
  };

  generateNumbers = async function () {
    let range = {
      from: 0,
      to: 99,
      [Symbol.iterator]() {
        this.current = this.from;
        return this;
      },

      next() {
        if (this.current <= this.to) {
          return {done: false, value: this.current++};
        } else {
          return {done: true};
        }
      },
    };

    for await (let number of range) {
      if (number < 10) {
        try {
          let img = await mergeImg([
            {src: baseImages + "iconFreeSpace.png"},
            {src: baseImages + number + "b.png"},
            {src: baseImages + "iconFreeSpace.png"},
          ]);
          await img.write(pathToImages + "0" + number + "b.png", () =>
            log.debug("done" + pathToImages + "0" + number + "b.png")
          );
          let img2 = await mergeImg([
            {src: imagePath},
            {
              src: pathToImages + "0" + number + ".bpng",
              offsetX: -32,
            },
          ]);
          await img2.write(pathToImages + iconTrayFilename, () =>
            log.debug("done0To9Generation")
          );
        } catch (e) {
          log.debug("safely ignored error");
        }
      } else {
        try {
          let lastDigit = number % 10;
          let decimalDigit = Math.floor((number / 10) % 10);
          let img = await mergeImg([
            {src: baseImages + decimalDigit + "b.png"},
            {
              src: baseImages + lastDigit + "b.png",
            },
          ]);
          await img.write(pathToImages + number + "b.png");
        } catch (e) {
          log.debug("safely ignored error");
        }
      }
    }
  };

  generateNumbersWithTray = async function () {
    let range = {
      from: 0,
      to: 99,
      [Symbol.iterator]() {
        this.current = this.from;
        return this;
      },

      next() {
        if (this.current <= this.to) {
          return {done: false, value: this.current++};
        } else {
          return {done: true};
        }
      },
    };

    for await (let number of range) {
            let lastDigit = number % 10;
            let decimalDigit = Math.floor((number / 10) % 10);
            let leadingZero="";
            if(decimalDigit==0)
              leadingZero="0";
        try {
          let img = await mergeImg([
            {src: "/home/m/p/stretchly/app/images/app-icons/" + "trayMactDark.png"},
            {
              src: pathToImages + leadingZero + number + "w.png",
              offsetX: -32,
            },
          ]);
          await img.write(pathToImages + "trayMactDark" + number + ".png");
        } catch (e) {
          log.debug("safely ignored error");
        }
      }
  };
}

module.exports = TrayWithText2;
