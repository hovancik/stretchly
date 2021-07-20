const mergeImg = require('merge-img-vwv')
const pathToImages = 'app/images/app-icons/numbers/generated-numbers/'
const pathToCircleImages = 'app/images/app-icons/round-clock/'
const log = require('electron-log')
const baseImages = 'app/images/app-icons/numbers/'

class TrayWithText {
  iconWithNumber (
    imagePath,
    minutesToLongBreak,
    darkModeString,
    monochrome,
    platform,
    invertedMonochromeString
  ) {
    const minutesOnTray = minutesToLongBreak
    if (monochrome) {
      if (platform === 'darwin') {
        return `${imagePath}traytMacMonochrome${minutesOnTray}Template.png`;
      } else {
        return `${imagePath}traytMonochrome${invertedMonochromeString}${minutesOnTray}.png`
      }
    } else {
      if (platform === 'darwin') {
        return `${imagePath}traytMac${darkModeString}${minutesOnTray}.png`
      } else {
        return `${imagePath}trayt${darkModeString}${minutesOnTray}.png`
      }
    }
  }

  pathWithCircularIcon (
    imagePath,
    minutesToLongBreak,
    totalLongBreak,
    darkModeString,
    monochrome,
    platform,
    invertedMonochromeString
  ) {
    const minutesOnTray = minutesToLongBreak
    const timeLeftRatio = minutesOnTray / totalLongBreak

    let pictureNo = '0'
    if (timeLeftRatio >= 0.875) {
      pictureNo = '0'
    } else if (timeLeftRatio < 0.875 && timeLeftRatio > 0.75) {
      pictureNo = '7'
    } else if (timeLeftRatio <= 0.75 && timeLeftRatio > 0.625) {
      pictureNo = '15'
    } else if (timeLeftRatio <= 0.625 && timeLeftRatio > 0.5) {
      pictureNo = '22'
    } else if (timeLeftRatio <= 0.5 && timeLeftRatio > 0.375) {
      pictureNo = '30'
    } else if (timeLeftRatio <= 0.375 && timeLeftRatio > 0.25) {
      pictureNo = '37'
    } else if (timeLeftRatio <= 0.25 && timeLeftRatio > 0.125) {
      pictureNo = '45'
    } else if (timeLeftRatio <= 0.125 && timeLeftRatio > 0.065) {
      pictureNo = '52'
    } else {
      pictureNo = '60'
    }
    if (monochrome) {
      if (platform === 'darwin') {
        return `${imagePath}traytMacMonochrome${pictureNo}Template.png`;
      } else {
        return `${imagePath}traytMonochrome${invertedMonochromeString}${pictureNo}.png`
      }
    } else {
      if (platform === 'darwin') {
        return `${imagePath}traytMac${darkModeString}${pictureNo}.png`
      } else {
        return `${imagePath}trayt${darkModeString}${pictureNo}.png`
      }
    }
  }

  async generateNumbers (color = 'b', mac = 'm') {
    const range = {
      from: 0,
      to: 99,
      [Symbol.iterator] () {
        this.current = this.from
        return this
      },

      next () {
        if (this.current <= this.to) {
          return { done: false, value: this.current++ }
        } else {
          return { done: true }
        }
      }
    }

    for await (const number of range) {
      if (number < 10) {
        try {
          const img = await mergeImg([
            { src: baseImages + mac + 'iconFreeSpace.png' },
            { src: baseImages + mac + number + color + '.png' },
            { src: baseImages + mac + 'iconFreeSpace.png' }
          ])
          await img.write(
            pathToImages + mac + '0' + number + color + '.png',
            () =>
              log.debug(
                'done' + pathToImages + mac + '0' + number + color + '.png'
              )
          )
        } catch (e) {
          log.debug(e + 'safely ignored error')
        }
      } else {
        try {
          const lastDigit = number % 10
          const decimalDigit = Math.floor((number / 10) % 10)
          const img = await mergeImg([
            { src: baseImages + mac + decimalDigit + color + '.png' },
            {
              src: baseImages + mac + lastDigit + color + '.png'
            }
          ])
          await img.write(pathToImages + mac + number + color + '.png')
        } catch (e) {
          log.debug(e + 'safely ignored error')
        }
      }
    }
  }

  async generateNumbersWithTray (
    color = 'b',
    createdName = 'traytMonochrome',
    mac = 'm',
    iconPath = '/home/m/p/stretchly/app/images/app-icons/traytMonochrome.png'
  ) {
    const range = {
      from: 0,
      to: 99,
      [Symbol.iterator] () {
        this.current = this.from
        return this
      },

      next () {
        if (this.current <= this.to) {
          return { done: false, value: this.current++ }
        } else {
          return { done: true }
        }
      }
    }

    for await (const number of range) {
      const decimalDigit = Math.floor((number / 10) % 10)
      let leadingZero = ''
      if (decimalDigit === 0) leadingZero = '0'
      try {
        let pictureOffset = -32
        let macTemplateEnd=''
        if (mac === 'm') {
          pictureOffset = -16
          macTemplateEnd = 'Template'
        }
        const img = await mergeImg([
          {
            src: iconPath
          },
          {
            src: pathToImages + mac + leadingZero + number + color + '.png',
            offsetX: pictureOffset
          }
        ])
        await img.write(
          pathToImages + createdName + number + macTemplateEnd + '.png'
        );
      } catch (e) {
        log.debug(e + 'safely ignored error')
      }
    }
  }

  async generateCirclesWithTray (
    color = 'b',
    createdName = 'traytMonochrome',
    mac = 'm',
    iconPath = '/home/m/p/stretchly/app/images/app-icons/traytMonochrome.png'
  ) {
    const range = {
      from: 0,
      to: 61,
      [Symbol.iterator] () {
        this.current = this.from
        return this
      },

      next () {
        if (this.current <= this.to) {
          return { done: false, value: this.current++ }
        } else {
          return { done: true }
        }
      }
    }

    for await (const number of range) {
      if (
        number === 0 ||
        number === 7 ||
        number === 15 ||
        number === 22 ||
        number === 30 ||
        number === 37 ||
        (number === 45) | (number === 52) ||
        number === 60
      ) {
        const leadingZero = ''
        let macTemplateEnd = ''
        try {
          let pictureOffset = -32
          if (mac === 'm') {
            pictureOffset = -16
            macTemplateEnd = 'Template'
          }
          const img = await mergeImg([
            {
              src: iconPath
            },
            {
              src:
                pathToCircleImages +
                mac +
                leadingZero +
                number +
                color +
                '.png',
              offsetX: pictureOffset
            }
          ])
          await img.write(
            pathToCircleImages + createdName + number + macTemplateEnd + '.png'
          );
        } catch (e) {
          log.debug(e + 'safely ignored error')
        }
      }
    }
  }
}

module.exports = TrayWithText
