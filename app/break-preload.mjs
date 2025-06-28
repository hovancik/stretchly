import {
  exposeBreaks,
  exposeI18next,
  exposeProcess,
  exposeSettings,
  exposeStretchly,
  exposeUtils
} from './utils/context-bridge-exposers.js'

exposeBreaks('long')
exposeI18next()
exposeProcess()
exposeSettings()
exposeStretchly()
exposeUtils()
