import { UntilMorning } from './untilMorning.js'
import log from 'electron-log/main.js'

const allOptions = {
  title: {
    long: '--title',
    short: '-T',
    description: 'Specify title for next break (Long or Mini)',
    withValue: true
  },
  text: {
    long: '--text',
    short: '-t',
    description: 'Specify text for next break (Long Break only)',
    withValue: true
  },
  noskip: {
    long: '--noskip',
    short: '-n',
    description: 'Do not skip directly to this break (Long or Mini)',
    withValue: false
  },
  wait: {
    long: '--wait',
    short: '-w',
    description: 'Specify an interval to wait before skipping to this break (Long or Mini) [HHhMMm|HHh|MMm|MM]',
    withValue: true
  },
  duration: {
    long: '--duration',
    short: '-d',
    description: 'Specify duration for pausing breaks (Pause only) [indefinitely|until-morning|HHhMMm|HHh|MMm|MM]',
    withValue: true
  }
}

const allCommands = {
  help: {
    description: 'Show this help message'
  },
  version: {
    description: 'Show current Stretchly version'
  },
  logs: {
    description: 'Show location of logs file'
  },
  reset: {
    description: 'Reset breaks'
  },
  pause: {
    description: 'Pause breaks',
    options: [allOptions.duration]
  },
  resume: {
    description: 'Resume from a pause'
  },
  toggle: {
    description: 'Pause/unpause breaks'
  },
  mini: {
    description: 'Skip to the Mini Break, customize it',
    options: [allOptions.title, allOptions.noskip, allOptions.wait]
  },
  long: {
    description: 'Skip to the Long Break, customize it',
    options: [allOptions.text, allOptions.title, allOptions.noskip, allOptions.wait]
  },
  preferences: {
    description: 'Open Preferences window'
  }
}

const allExamples = [{
  cmd: 'stretchly pause',
  description: 'Pause breaks indefinitely'
},
{
  cmd: 'stretchly pause -d 60',
  description: 'Pause breaks for one hour'
},
{
  cmd: 'stretchly pause -d 1h',
  description: 'Pause breaks for one hour'
},
{
  cmd: 'stretchly pause -d 1h20m',
  description: 'Pause breaks for one hour and twenty minutes'
},
{
  cmd: 'stretchly mini -T "Stretch up!"',
  description: 'Start a Mini Break, with the title "Stretch up!"'
},
{
  cmd: 'stretchly long -T "Stretch up!" --noskip',
  description: 'Set the next Break\'s title to "Stretch up!"'
},
{
  cmd: 'stretchly long -T "Stretch up!" -t "Go stretch!"',
  description: 'Start a long break, with the title "Stretch up!" and text "Go stretch!"'
},
{
  cmd: 'stretchly long -w 20m -T "Stretch up!"',
  description: 'Wait 20 minutes, then start a long break with the title set to "Stretch up!"'
},
{
  cmd: 'stretchly preferences',
  description: 'Open Preferences window'
}]

// Parse cmd line, check if valid and put variables in a dedicated object
class Command {
  constructor (input, version, isFirstInstance = true) {
    this.version = version
    this.isFirstInstance = isFirstInstance
    this.supported = allCommands
    this.hasSupportedCommand = false

    this.parse(input)
  }

  parse (input) {
    // filter out electron flags first
    let i = 0
    while (i < input.length && input[i].startsWith('--')) {
      i++
    }

    const args = input.slice(i)
    this.command = args[0]

    if (this.command === undefined) {
      this.command = 'help'
    }

    if (!this.supported[this.command]) {
      log.error(`Stretchly${this.isFirstInstance ? '' : ' 2'}: command '${this.command}' is not supported`)
      return
    }

    this.options = this.getOpts(args.slice(1))
    this.hasSupportedCommand = true
  }

  getOpts (opts) {
    const options = {}

    if (!this.supported[this.command].options) {
      return null
    }

    for (let i = 0; i < opts.length; i++) {
      const name = opts[i]
      let valid = false

      this.supported[this.command].options.forEach(opt => {
        if (opt.long === name || opt.short === name) {
          valid = true
          if (opt.withValue) {
            options[opt.long.slice(2)] = opts[i + 1]
            i++
          } else {
            options[opt.long.slice(2)] = true
          }
        }
      })

      if (!valid) {
        log.error(`Stretchly${this.isFirstInstance ? '' : ' 2'}: option '${name}' is not valid for command '${this.command}'`)
      }
    }

    return options
  }

  runOrForward () {
    switch (this.command) {
      case 'help':
        this.help()
        break

      case 'version':
        this.ver()
        break

      case 'logs':
        this.logs()
        break

      default:
        if (this.hasSupportedCommand) {
          log.info(`Stretchly${this.isFirstInstance ? '' : ' 2'}: forwarding command '${this.command}' to the main instance`)
        }
    }
  }

  durationToMs (settings) {
    if (!this.options.duration) {
      return 1
    }

    switch (this.options.duration) {
      case 'indefinitely':
        return 1

      case 'until-morning':
        return new UntilMorning(settings).msToSunrise()

      default:
        return parseDuration(this.options.duration)
    }
  }

  waitToMs () {
    if (!this.options.wait) {
      return 0
    }

    return parseDuration(this.options.wait)
  }

  checkInMain () {
    if (!this.command) {
      return false
    }

    if (this.command === 'version' || this.command === 'help') {
      return false
    }

    return true
  }

  ver () {
    console.log(`Stretchly version ${this.version}`)
  }

  logs () {
    console.log(log.transports.file.getFile().path)
  }

  cmdHelp () {
    let i = 0
    const options = '[options]'
    let part = `Usage: stretchly <command> ${options}\n\nCommands:`

    const cmds = Object.keys(this.supported).map(key => `${key}${this.supported[key].options === undefined ? '' : ` ${options}`}`)
    const longuest = cmds.reduce((acc, cur) => acc > cur.length ? acc : cur.length, 0)

    part = Object.keys(this.supported).reduce((acc, key) => {
      const padding = longuest - cmds[i].length
      const line = `stretchly ${cmds[i]}${' '.repeat(padding)} ${this.supported[key].description}`
      i++
      return `${acc}\n\t${line}`
    }, part)

    return part
  }

  optionsHelp () {
    let part = '\n\nOptions:'

    const longuest = Object.keys(allOptions).reduce((acc, key) => acc > allOptions[key].long.length ? acc : allOptions[key].long.length, 0)

    part = Object.keys(allOptions).reduce((acc, key) => {
      const opt = allOptions[key]
      const padding = longuest - opt.long.length
      const line = `${opt.short}, ${opt.long}${' '.repeat(padding)} ${opt.description}`
      return `${acc}\n\t${line}`
    }, part)

    return part
  }

  examplesHelp () {
    let part = '\n\nExamples:'

    const longuest = allExamples.reduce((acc, cur) => acc > cur.cmd.length ? acc : cur.cmd.length, 0)

    part = allExamples.reduce((acc, ex) => {
      const padding = longuest - ex.cmd.length
      const line = `${ex.cmd}${' '.repeat(padding)} ${ex.description}`
      return `${acc}\n\t${line}`
    }, part)

    return part
  }

  help () {
    console.log([this.cmdHelp(), this.optionsHelp(), this.examplesHelp()].join(''))
  }
}

// this function should return -1 if duration can't be parsed
function parseDuration (input) {
  if (input.match(/^\d+$/) != null) {
    const mins = Number.parseInt(input)
    const result = mins * minToMs
    return result > 0 ? result : -1
  }

  const parts = input.toLowerCase().match(/^(?:(\d+)h)?(?:(\d+)m)?$/)
  if (parts === null || parts[0] === '') {
    return -1
  }

  const hours = parts[1] ? Number.parseInt(parts[1]) : 0
  const minutes = parts[2] ? Number.parseInt(parts[2]) : 0
  const result = hours * minToMs * 60 + minutes * minToMs
  return isNaN(result) || result <= 0 ? -1 : result
}

const minToMs = 60000

export default Command
