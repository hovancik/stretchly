import { execFileSync } from 'node:child_process'
import { mkdirSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const directory = dirname(fileURLToPath(import.meta.url))
const source = join(directory, 'main.swift')
const output = join(directory, 'build', 'call-detector')
const architectures = ['arm64', 'x86_64']
const minimumMacOSVersion = '13.0'
const identifier = 'net.hovancik.stretchly.call-detector'

export function buildCallDetector () {
  if (process.platform !== 'darwin') {
    console.log('call-detector: skipping build, it is only used on macOS')
    return
  }
  mkdirSync(dirname(output), { recursive: true })
  const slices = architectures.map(architecture => {
    const slice = `${output}-${architecture}`
    execFileSync('xcrun', ['swiftc', '-O', '-target', `${architecture}-apple-macos${minimumMacOSVersion}`,
      source, '-o', slice], { stdio: 'inherit' })
    return slice
  })
  execFileSync('xcrun', ['lipo', '-create', '-output', output, ...slices], { stdio: 'inherit' })
  slices.forEach(slice => rmSync(slice))
  console.log(`call-detector: built ${output}`)
}

export function beforePack (context) {
  if (context.electronPlatformName === 'darwin') {
    buildCallDetector()
  }
}

// electron-builder would sign the helper with the app's JIT and library
// validation entitlements, so it is signed here without any and skipped
// via `mac.signIgnore`.
export function afterPack (context) {
  const configuredIdentity = context.packager.platformSpecificBuildOptions.identity
  if (context.electronPlatformName !== 'darwin' || configuredIdentity === null) return
  const identity = configuredIdentity || process.env.CSC_NAME || '-'
  const helper = join(context.appOutDir, `${context.packager.appInfo.productFilename}.app`,
    'Contents', 'Resources', 'call-detector')
  const timestamp = identity === '-' ? [] : ['--timestamp']
  execFileSync('/usr/bin/codesign', ['--force', '--sign', identity, '--options', 'runtime',
    '--identifier', identifier, ...timestamp, helper], { stdio: 'inherit' })
  console.log(`call-detector: signed ${helper}`)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  buildCallDetector()
}
