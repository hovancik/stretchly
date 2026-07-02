// Script to generate tray icons
// Requires `@napi-rs/canvas`, `png-to-ico` (npm packages) and, for the `base` step only, the `inkscape` CLI.
// Install the npm packages before running: `npm install --no-save @napi-rs/canvas png-to-ico`
// The committed icons were generated with @napi-rs/canvas@1.0.0 and png-to-ico@3.0.1; pin to these
// versions to reproduce the exact glyph rendering and avoid a noisy regenerated binary diff.
// Run this script using `node graphics/time-intray-icon-generator.js`
// You can optionally pass an argument to generate only specific icons:
// `node graphics/time-intray-icon-generator.js base` - generate base PNGs from SVGs using Inkscape
// `node graphics/time-intray-icon-generator.js baseico` - generate Windows .ico for the base/paused icons
// `node graphics/time-intray-icon-generator.js numbers` - generate number overlay icons (0-99)
// `node graphics/time-intray-icon-generator.js progress` - generate progress overlay icons (0-100)
//
// Windows tray icons are emitted as multi-size .ico files (16/20/24/32 = 100/125/150/200% DPI) so Windows
// can pick the crisp native size per display. macOS keeps Template/@2x PNGs and Linux keeps 32px PNGs.
import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas'
import pngToIco from 'png-to-ico'
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const iconsDir = path.join(__dirname, '../app/images/app-icons')

// Use a bolder font for better legibility of the numbers at small tray sizes
GlobalFonts.registerFromPath(path.join(__dirname, 'NotoSans-Bold.ttf'), 'Noto Sans Bold')
const fontFamily = 'Noto Sans Bold'

// Windows DPI ladder embedded in every .ico (100% / 125% / 150% / 200%)
const winIcoSizes = [16, 20, 24, 32]
// Linux tray uses a single PNG; macOS uses 16 + 32@2x
const linuxSize = 32

const baseImageCache = new Map()
async function loadBase (name) {
  if (!baseImageCache.has(name)) {
    baseImageCache.set(name, await loadImage(path.join(iconsDir, `${name}.png`)))
  }
  return baseImageCache.get(name)
}

function newContext (size) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')
  ctx.imageSmoothingEnabled = true
  ctx.quality = 'best'
  return { canvas, ctx }
}

function drawText (ctx, size, text, fontColor) {
  const textHeightRatio = 0.75
  const maxTextWidthRatio = 0.9
  const safeAreaWidthRatio = 0.12
  ctx.font = `${textHeightRatio * size}px '${fontFamily}'`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const textMetrics = ctx.measureText(text)
  const verticalOffsetFix = (textMetrics.actualBoundingBoxAscent - textMetrics.actualBoundingBoxDescent) / 2
  const x = size / 2
  const y = size / 2 + verticalOffsetFix
  const maxTextWidth = maxTextWidthRatio * size

  ctx.save()
  ctx.globalCompositeOperation = 'destination-out'
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.lineWidth = Math.max(1, safeAreaWidthRatio * size)
  ctx.strokeText(text, x, y, maxTextWidth)
  ctx.fillText(text, x, y, maxTextWidth)
  ctx.restore()

  ctx.fillStyle = fontColor
  ctx.fillText(text, x, y, maxTextWidth)
}

async function renderText (baseName, size, text, fontColor) {
  const baseImage = await loadBase(baseName)
  const { canvas, ctx } = newContext(size)
  ctx.globalAlpha = 0.6
  ctx.drawImage(baseImage, 0, 0, size, size)
  ctx.globalAlpha = 1.0
  drawText(ctx, size, text, fontColor)
  return canvas.toBuffer('image/png')
}

async function renderProgress (baseName, foregroundName, size, percentage) {
  const baseImage = await loadBase(baseName)
  const foregroundImage = await loadBase(foregroundName)
  const { canvas, ctx } = newContext(size)
  ctx.globalAlpha = 0.6
  ctx.drawImage(baseImage, 0, 0, size, size)
  ctx.globalAlpha = 1.0
  const fillHeight = size * (percentage / 100)
  const y = size - fillHeight
  ctx.save()
  ctx.beginPath()
  ctx.rect(0, y, size, fillHeight)
  ctx.clip()
  ctx.drawImage(foregroundImage, 0, 0, size, size)
  ctx.restore()
  return canvas.toBuffer('image/png')
}

async function renderPlain (baseName, size) {
  const baseImage = await loadBase(baseName)
  const { canvas, ctx } = newContext(size)
  ctx.drawImage(baseImage, 0, 0, size, size)
  return canvas.toBuffer('image/png')
}

function writePng (name, buffer) {
  fs.writeFileSync(path.join(iconsDir, `${name}.png`), buffer)
}

async function writeIco (name, frames) {
  fs.writeFileSync(path.join(iconsDir, `${name}.ico`), await pngToIco(frames))
}

// Tray families rendered for Windows (.ico) and Linux (.png)
const winLinuxFamilies = [
  { name: 'tray', base: 'tray', fontColor: '#000000' },
  { name: 'trayDark', base: 'trayDark', fontColor: '#ffffff' },
  { name: 'trayMonochrome', base: 'trayMonochrome', fontColor: '#000000' },
  { name: 'trayMonochromeInverted', base: 'trayMonochromeInvertedOverlay', foreground: 'trayMonochromeInverted', fontColor: '#ffffff' }
]

// Tray families rendered for macOS (16 + 32@2x PNGs). Monochrome uses Template (OS-tinted).
const macFamilies = [
  { name: 'trayMac', base: 'trayMac', suffix: '', fontColor: '#000000' },
  { name: 'trayMacDark', base: 'trayMacDark', suffix: '', fontColor: '#ffffff' },
  { name: 'trayMacMonochrome', base: 'trayMacMonochromeTemplate', suffix: 'Template', fontColor: '#000000' }
]

// Base/paused icons that need a Windows .ico (no number overlay)
const baseIcoNames = [
  'tray', 'trayDark', 'trayPaused', 'trayPausedDark',
  'trayMonochrome', 'trayMonochromePaused',
  'trayMonochromeInverted', 'trayMonochromeInvertedPaused'
]

async function generateBase () {
  const baseIcons = [
    { svg: 'appicon-colour-light-mode.svg', outputs: [{ name: 'tray.png', size: 32 }, { name: 'trayMac.png', size: 16 }, { name: 'trayMac@2x.png', size: 32 }] },
    { svg: 'appicon-colour-dark-mode.svg', outputs: [{ name: 'trayDark.png', size: 32 }, { name: 'trayMacDark.png', size: 16 }, { name: 'trayMacDark@2x.png', size: 32 }] },
    { svg: 'appicon-colour-light-mode-paused.svg', outputs: [{ name: 'trayPaused.png', size: 32 }, { name: 'trayMacPaused.png', size: 16 }, { name: 'trayMacPaused@2x.png', size: 32 }] },
    { svg: 'appicon-colour-dark-mode-paused.svg', outputs: [{ name: 'trayPausedDark.png', size: 32 }, { name: 'trayMacPausedDark.png', size: 16 }, { name: 'trayMacPausedDark@2x.png', size: 32 }] },
    { svg: 'appicon-mono-light-mode.svg', outputs: [{ name: 'trayMonochrome.png', size: 32 }, { name: 'trayMacMonochromeTemplate.png', size: 16 }, { name: 'trayMacMonochromeTemplate@2x.png', size: 32 }] },
    { svg: 'appicon-mono-light-mode-paused.svg', outputs: [{ name: 'trayMonochromePaused.png', size: 32 }, { name: 'trayMacMonochromePausedTemplate.png', size: 16 }, { name: 'trayMacMonochromePausedTemplate@2x.png', size: 32 }] },
    { svg: 'appicon-mono-dark-mode.svg', outputs: [{ name: 'trayMonochromeInverted.png', size: 32 }] },
    { svg: 'appicon-mono-dark-mode-overlay.svg', outputs: [{ name: 'trayMonochromeInvertedOverlay.png', size: 32 }] },
    { svg: 'appicon-mono-dark-mode-paused.svg', outputs: [{ name: 'trayMonochromeInvertedPaused.png', size: 32 }] }
  ]
  for (const icon of baseIcons) {
    const svgPath = path.join(__dirname, icon.svg)
    for (const output of icon.outputs) {
      const outputPath = path.join(iconsDir, output.name)
      execSync(`inkscape '${svgPath}' --export-type=png --export-filename='${outputPath}' --export-width=${output.size} --export-height=${output.size} --export-background-opacity=0`)
      console.log(`Generated ${output.name} (${output.size}x${output.size}) from ${icon.svg}`)
    }
  }
}

async function generateBaseIco () {
  for (const name of baseIcoNames) {
    const frames = await Promise.all(winIcoSizes.map(size => renderPlain(name, size)))
    await writeIco(name, frames)
  }
  console.log('Base/paused .ico icons generated.')
}

async function generateNumbers () {
  for (const family of winLinuxFamilies) {
    for (let i = 0; i < 100; i++) {
      const text = i.toString()
      const frames = await Promise.all(winIcoSizes.map(size => renderText(family.base, size, text, family.fontColor)))
      writePng(`${family.name}Number${i}`, frames[winIcoSizes.indexOf(linuxSize)])
      await writeIco(`${family.name}Number${i}`, frames)
    }
    console.log(`Number icons for ${family.name} processed (.png + .ico).`)
  }
  for (const family of macFamilies) {
    for (let i = 0; i < 100; i++) {
      const text = i.toString()
      writePng(`${family.name}Number${i}${family.suffix}`, await renderText(family.base, 16, text, family.fontColor))
      writePng(`${family.name}Number${i}${family.suffix}@2x`, await renderText(`${family.base}@2x`, 32, text, family.fontColor))
    }
    console.log(`Number icons for ${family.name} (mac) processed.`)
  }
}

async function generateProgress () {
  for (const family of winLinuxFamilies) {
    const foreground = family.foreground || family.base
    for (let i = 0; i <= 100; i++) {
      const frames = await Promise.all(winIcoSizes.map(size => renderProgress(family.base, foreground, size, i)))
      writePng(`${family.name}Progress${i}`, frames[winIcoSizes.indexOf(linuxSize)])
      await writeIco(`${family.name}Progress${i}`, frames)
    }
    console.log(`Progress icons for ${family.name} processed (.png + .ico).`)
  }
  for (const family of macFamilies) {
    for (let i = 0; i <= 100; i++) {
      writePng(`${family.name}Progress${i}${family.suffix}`, await renderProgress(family.base, family.base, 16, i))
      writePng(`${family.name}Progress${i}${family.suffix}@2x`, await renderProgress(`${family.base}@2x`, `${family.base}@2x`, 32, i))
    }
    console.log(`Progress icons for ${family.name} (mac) processed.`)
  }
}

const generationMode = process.argv[2]

if (generationMode === 'base') {
  await generateBase()
} else {
  if (!generationMode || generationMode === 'baseico') await generateBaseIco()
  if (!generationMode || generationMode === 'numbers') await generateNumbers()
  if (!generationMode || generationMode === 'progress') await generateProgress()
}
