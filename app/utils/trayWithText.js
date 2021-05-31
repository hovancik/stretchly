const {Tray} = require('electron');
const mergeImg = require('merge-img-vwv');
const pathToImages = 'app/images/app-icons/numbers/generated-numbers/';
const log = require('electron-log');
const iconTrayFilename = 'trayIcon.png';
const baseImages = 'app/images/app-icons/numbers/';

class TrayWithText extends Tray {
  setTrayWhenNeeded = async function (trayPath, minutes, showNumbers, showClockIcon) {
    if (showNumbers) {
      this.showWithNumber(trayPath, minutes);
      this.setImage(pathToImages + iconTrayFilename);
    } 
    else if(showClockIcon){
      
    }
    else {
      this.setImage(trayPath);
    }
  };

  showWithNumber = async function (imagePath, minutesToLongBreak) {
    let minutesOnTray = minutesToLongBreak;
    if (minutesToLongBreak < 10) {
      minutesOnTray = '0' + minutesToLongBreak;
    }
    try {
      let img = await mergeImg([
        {src: imagePath},
        {
          src: pathToImages + minutesOnTray + '.png',
          offsetX: -32,
        },
      ]);
      await img.write(pathToImages + iconTrayFilename, () => log.debug('done'));
    } catch (e) {
      log.debug('safely ignored error');
    }
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
            {src: baseImages + 'iconFreeSpace.png'},
            {src: baseImages + number + '.png'},
            {src: baseImages + 'iconFreeSpace.png'},
          ]);
          await img.write(pathToImages + '0' + number + '.png', () =>
            log.debug('done' + pathToImages + '0' + number + '.png')
          );
          let img2 = await mergeImg([
            {src: imagePath},
            {
              src: pathToImages + '0' + number + '.png',
              offsetX: -32,
            },
          ]);
          await img2.write(pathToImages + iconTrayFilename, () =>
            log.debug('done')
          );
        } catch (e) {
          log.debug('safely ignored error');
        }
      } else {
        try {
          let lastDigit = number % 10;
          let decimalDigit = Math.floor((number / 10) % 10);
          let img = await mergeImg([
            {src: baseImages + decimalDigit + '.png'},
            {
              src: baseImages + lastDigit + '.png',
            },
          ]);
          await img.write(pathToImages + number + '.png');
        } catch (e) {
          log.debug('safely ignored error');
        }
      }
    }
  };
}

module.exports = TrayWithText;
