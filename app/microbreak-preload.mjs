import {
  exposeBreaks,
  exposeI18next,
  exposeProcess,
  exposeSettings,
  exposeStretchly,
  exposeUtils
} from './utils/context-bridge-exposers.js'

exposeBreaks('mini')
exposeI18next()
exposeProcess()
exposeSettings()
exposeStretchly()
exposeUtils()
