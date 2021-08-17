const mergeImg = require('merge-img-vwv')
const pathToImages = 'app/images/app-icons/numbers/generated-numbers/'
const pathToCircleImages = 'app/images/app-icons/round-clock/'
const log = require('electron-log')
const baseImages = 'app/images/app-icons/numbers/'

class TrayWithText {
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
    createdName = 'traytMacMonochrome',
    mac = 'm',
    iconPath = '/home/m/p/stretchly/app/images/app-icons/traytMacMonochrome.png'
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
        let macTemplateEnd = ''
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
        )
      } catch (e) {
        log.debug(e + 'safely ignored error')
      }
    }
  }

  async generateCirclesWithTray (
    color = 'b',
    createdName = 'traytMacMonochrome',
    mac = 'm',
    iconPath = '/home/m/p/stretchly/app/images/app-icons/traytMacMonochrome.png'
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
          )
        } catch (e) {
          log.debug(e + 'safely ignored error')
        }
      }
    }
  }
}

module.exports = TrayWithText
