import {
  exposeElectronApi,
  exposeBreaks,
  exposeI18next,
  exposeRuntime,
  exposeSettings,
  exposeStretchly,
  exposeUtils,
  exposeAnki
} from './utils/context-bridge-exposers.js'

exposeElectronApi()
exposeBreaks('long')
exposeI18next()
exposeRuntime()
exposeSettings()
exposeStretchly()
exposeUtils()
exposeAnki()
