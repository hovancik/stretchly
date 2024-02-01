// https://github.com/electron-userland/spectron/issues/656
// const Application = require('spectron').Application
// const electronPath = require('electron')
// const Store = require('electron-store')
//
// const chai = require('chai')
// const chaiAsPromised = require('chai-as-promised')
//
// const path = require('path')
// const rimraf = require('rimraf')
//
// chai.should()
// chai.use(chaiAsPromised)
// const timeout = process.env.CI ? 60000 : 10000
//
describe.skip('stretchly', function () {
//   const tempDir = path.join(__dirname, './stretchly-test-tmp')
//   const settings = new Store({
//     cwd: path.join(__dirname),
//     name: 'test-settings',
//     defaults: require('../app/utils/defaultSettings')
//   })
//
//   this.timeout(timeout)
//
//   async function launchAndWaitForWindowToLoad (app) {
//     await app.start()
//     await app.client.waitUntilWindowLoaded()
//   }
//
//   async function forceMicrobreak (app) {
//     settings.set('microbreak', true)
//     settings.set('microbreakInterval', 200)
//     settings.set('microbreakNotificationInterval', 100)
//
//     await launchAndWaitForWindowToLoad(app)
//
//     // give the microbreak a moment to be created and displayed
//     await new Promise(resolve => setTimeout(resolve, 250))
//   }
//
//   beforeEach(function () {
//     this.app = new Application({
//       path: electronPath,
//       args: [
//         path.join(__dirname, '../app')
//       ],
//       chromeDriverArgs: [
//         `--user-data-dir=${tempDir}`
//       ]
//     })
//   })
//
//   afterEach(function () {
//     if (this.app.client.getMainProcessLogs) {
//       this.app.client.getMainProcessLogs().then(function (logs) {
//         logs.forEach((log) => {
//           log.split('\n')
//             .forEach((l) => console.log('[APP]\t' + l))
//         })
//       })
//     }
//
//     // using sync rimraf because async causes flaky tests even if awaited
//     rimraf.sync(tempDir)
//
//     if (this.app && this.app.isRunning()) {
//       return this.app.stop()
//     }
//   })
//
//   describe('on first run', function () {
//     beforeEach(async function () {
//       settings.set('isFirstRun', true)
//       await launchAndWaitForWindowToLoad(this.app)
//     })
//
//     it('creates two windows', async function () {
//       const windowCount = await this.app.client.getWindowCount()
//       windowCount.should.equal(2)
//     })
//
//     it('first window is visible', async function () {
//       const visible = await this.app.client.browserWindow.isVisible()
//       visible.should.equal(true)
//     })
//
//     it('main window is the welcome window', async function () {
//       const title = await this.app.client.browserWindow.getTitle()
//       title.should.contain('Welcome')
//     })
//
//     it('second window is not visible', async function () {
//       await this.app.client.windowByIndex(1)
//       const visible = await this.app.client.browserWindow.isVisible()
//       visible.should.equal(false)
//     })
//   })
//
//   describe('on subsequent runs', function () {
//     beforeEach(async function () {
//       settings.set('isFirstRun', false)
//       await launchAndWaitForWindowToLoad(this.app)
//     })
//
//     it('creates only one window', async function () {
//       const windowCount = await this.app.client.getWindowCount()
//       windowCount.should.equal(1)
//     })
//
//     it('created window is not visible', async function () {
//       const visible = await this.app.client.browserWindow.isVisible()
//       visible.should.equal(false)
//     })
//
//     it('main window is not the welcome window', async function () {
//       const title = await this.app.client.browserWindow.getTitle()
//       title.should.not.contain('Welcome')
//     })
//
//     it('main window is the Stretchly window', async function () {
//       const title = await this.app.client.browserWindow.getTitle()
//       title.should.equal('Stretchly')
//     })
//   })
//
//   describe('microbreak window', function () {
//     beforeEach('force microbreak', async function () {
//       settings.set('isFirstRun', false)
//       await forceMicrobreak(this.app)
//       await this.app.client.windowByIndex(1)
//     })
//
//     it('is created', async function () {
//       const title = await this.app.client.browserWindow.getTitle()
//       title.should.contain('take a break')
//     })
//
//     it('cannot be closed', async function () {
//       await this.app.client.browserWindow.close()
//       const isDestroyed = await this.app.client.browserWindow.isDestroyed()
//       isDestroyed.should.equal(false)
//     })
//
//     it('has postpone button', async function () {
//       await this.app.client.waitUntilTextExists('#postpone', 'Postpone', 500)
//     })
//
//     it('is not focused', async function () {
//       const isDestroyed = await this.app.client.browserWindow.isFocused()
//       isDestroyed.should.equal(false)
//     })
//   })
//
//   describe('when acting as regular window, microbreak', function () {
//     beforeEach('force microbreak', async function () {
//       settings.set('isFirstRun', false)
//       settings.set('showBreaksAsRegularWindows', true)
//       await forceMicrobreak(this.app)
//       await this.app.client.windowByIndex(1)
//     })
//
//     it('cannot be closed', async function () {
//       await this.app.client.browserWindow.close()
//       const isDestroyed = await this.app.client.browserWindow.isDestroyed()
//       isDestroyed.should.equal(false)
//     })
//
//     it('is focused', async function () {
//       const isFocused = await this.app.client.browserWindow.isFocused()
//       isFocused.should.equal(true)
//     })
//
//     it('does not stop application from quitting', async function () {
//       await this.app.stop()
//     })
//   })
})
