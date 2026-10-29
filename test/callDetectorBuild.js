import { expect, vi } from 'vitest'
import 'chai/register-should'
import { join } from 'path'
import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { afterPack, beforePack } from '../native/call-detector/build.js'

vi.mock('node:child_process', async (importOriginal) => ({
  ...await importOriginal(),
  execFileSync: vi.fn()
}))

const packageJson = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf8'))
const appOutDir = join('dist', 'mac-arm64')
const helper = join(appOutDir, 'Stretchly.app', 'Contents', 'Resources', 'call-detector')

const packContext = (identity, electronPlatformName = 'darwin') => ({
  electronPlatformName,
  appOutDir,
  packager: {
    appInfo: { productFilename: 'Stretchly' },
    platformSpecificBuildOptions: { identity }
  }
})

describe('call-detector packaging', function () {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  it('signs the bundled helper with hardened runtime and no entitlements', () => {
    afterPack(packContext('-'))
    expect(execFileSync).toHaveBeenCalledOnce()
    const [command, args] = execFileSync.mock.calls[0]
    command.should.be.equal('/usr/bin/codesign')
    args.should.be.deep.equal(['--force', '--sign', '-', '--options', 'runtime',
      '--identifier', 'net.hovancik.stretchly.call-detector', helper])
  })

  it('signs the helper with the configured identity and a timestamp', () => {
    afterPack(packContext('Developer ID Application: Example'))
    const [, args] = execFileSync.mock.calls[0]
    args.should.include('Developer ID Application: Example')
    args.should.include('--timestamp')
    args.should.not.include('--entitlements')
  })

  it('does not sign the helper when signing is disabled or not building for macOS', () => {
    afterPack(packContext(null))
    afterPack(packContext('-', 'linux'))
    beforePack({ electronPlatformName: 'win32' })
    expect(execFileSync).not.toHaveBeenCalled()
  })

  it('keeps electron-builder from signing the helper with the app entitlements', () => {
    const { build } = packageJson
    build.afterPack.should.be.equal('./native/call-detector/build.js')
    build.mac.extraResources.should.deep.include({ from: 'native/call-detector/build/call-detector', to: 'call-detector' })
    build.mac.signIgnore.some(pattern => new RegExp(pattern).test('/Applications/Stretchly.app/Contents/Resources/call-detector'))
      .should.be.equal(true)
    build.mac.signIgnore.some(pattern => new RegExp(pattern).test('/Applications/Stretchly.app/Contents/MacOS/Stretchly'))
      .should.be.equal(false)
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.restoreAllMocks()
  })
})
