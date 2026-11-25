import {
  exposeI18next,
  exposeRuntime,
  exposeSettings
} from './utils/context-bridge-exposers.js'

exposeI18next()
exposeRuntime()
exposeSettings()
