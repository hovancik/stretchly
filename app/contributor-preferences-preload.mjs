import {
  exposeI18next,
  exposeProcess,
  exposeSettings
} from './utils/context-bridge-exposers.js'

exposeI18next()
exposeProcess()
exposeSettings()
