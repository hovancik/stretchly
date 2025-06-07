import { exposeGlobal, exposeI18next, exposeProcess, exposeSettings, exposeStretchly } from './utils/context-bridge-exposers.js'

exposeGlobal()
exposeI18next()
exposeProcess()
exposeSettings()
exposeStretchly()
