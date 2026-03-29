// Script to generate tray icons
// `canvas` npm package and `inkscape` CLI are not installed so install them before running this script
// Run this script using `node graphics/time-intray-icon-generator.js`
// You can optionally pass an argument to generate only specific icons:
// `node graphics/time-intray-icon-generator.js base` - generate base PNGs from SVGs using Inkscape
// `node graphics/time-intray-icon-generator.js numbers` - generate number overlay icons (0-99)
// `node graphics/time-intray-icon-generator.js progress` - generate progress overlay icons (0-100)
import { createCanvas, loadImage, registerFont } from 'canvas'
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load the font (make sure the font file is available in your project directory)
registerFont(path.join(__dirname, '../app/css/fonts/NotoSans-Regular.ttf'), { family: 'Noto Sans Regular' })

async function overlayTextOnImage (inputImagePath, outputImagePath, text, fontColor, fontFamily) {
  try {
    // Load the input image
    const baseImage = await loadImage(inputImagePath)
    // For now the baseImage sets the icon dimensions (might change if SVGs get used as the baseImage)
    const imageWidth = baseImage.width
    const imageHeight = baseImage.height

    const canvas = createCanvas(imageWidth, imageHeight)
    const ctx = canvas.getContext('2d')

    // Draw background (faint version of the logo)
    ctx.globalAlpha = 0.6
    ctx.drawImage(baseImage, 0, 0, imageWidth, imageHeight)
    ctx.globalAlpha = 1.0

    // Set the font properties
    const textHeightRatio = 0.75
    const maxTextWidthRatio = 0.9
    ctx.quality = 'best'
    ctx.font = `${textHeightRatio * imageHeight}px '${fontFamily}'`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // Calculate the position to center the text
    const textMetrics = ctx.measureText(text)
    // Offset the text, so the drawn text is vertically centered, not its baseline
    const verticalOffsetFix = (textMetrics.actualBoundingBoxAscent - textMetrics.actualBoundingBoxDescent) / 2
    const textX = imageWidth / 2
    const textY = imageHeight / 2 + verticalOffsetFix

    // Use Shadow/Glow instead of Stroke for better legibility at small sizes
    ctx.shadowColor = fontColor === '#000000' ? '#ffffff' : '#000000'
    ctx.shadowBlur = 4
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0

    ctx.fillStyle = fontColor

    // Draw the text onto the canvas
    ctx.fillText(text, textX, textY, maxTextWidthRatio * imageWidth)

    // Convert the canvas to a buffer
    const buffer = canvas.toBuffer('image/png')

    // Save the output image
    fs.writeFileSync(outputImagePath, buffer)
  } catch (error) {
    console.error('Error creating image with overlay text:', error)
  }
}

async function overlayProgressOnImage (inputImagePath, foregroundImagePath, outputImagePath, percentage, fontColor) {
  try {
    const baseImage = await loadImage(inputImagePath)
    const foregroundImage = await loadImage(foregroundImagePath)
    const imageWidth = baseImage.width
    const imageHeight = baseImage.height

    const canvas = createCanvas(imageWidth, imageHeight)
    const ctx = canvas.getContext('2d')

    // Draw background (faint version of the logo)
    ctx.globalAlpha = 0.6
    ctx.drawImage(baseImage, 0, 0, imageWidth, imageHeight)

    // Draw foreground (full opacity, clipped to percentage)
    ctx.globalAlpha = 1.0
    const fillHeight = imageHeight * (percentage / 100)
    const y = imageHeight - fillHeight

    ctx.save()
    ctx.beginPath()
    ctx.rect(0, y, imageWidth, fillHeight)
    ctx.clip()
    ctx.drawImage(foregroundImage, 0, 0, imageWidth, imageHeight)
    ctx.restore()

    const buffer = canvas.toBuffer('image/png')
    fs.writeFileSync(outputImagePath, buffer)
  } catch (error) {
    console.error('Error creating image with overlay progress:', error)
  }
}

const fontFamily = 'Noto Sans Regular'
const generationMode = process.argv[2]

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

if (generationMode === 'base') {
  for (const icon of baseIcons) {
    const svgPath = path.join(__dirname, icon.svg)
    for (const output of icon.outputs) {
      const outputPath = path.join(__dirname, `../app/images/app-icons/${output.name}`)
      execSync(`inkscape '${svgPath}' --export-type=png --export-filename='${outputPath}' --export-width=${output.size} --export-height=${output.size} --export-background-opacity=0`)
      console.log(`Generated ${output.name} (${output.size}x${output.size}) from ${icon.svg}`)
    }
  }
  process.exit(0)
}

const iconStyles = [
  {
    name: 'tray',
    fontColor: '#000000'
  },
  {
    name: 'trayDark',
    fontColor: '#ffffff'
  },
  {
    name: 'trayMonochrome',
    fontColor: '#000000',
    fontSize: 25.5
  },
  {
    name: 'trayMonochromeInverted',
    inputName: 'trayMonochromeInvertedOverlay',
    foregroundName: 'trayMonochromeInverted',
    fontColor: '#ffffff'
  },
  {
    name: 'trayMac',
    fontColor: '#000000'
  },
  {
    name: ['trayMac', '@2x'],
    fontColor: '#000000'
  },
  {
    name: 'trayMacDark',
    fontColor: '#ffffff'
  },
  {
    name: ['trayMacDark', '@2x'],
    fontColor: '#ffffff'
  },
  {
    name: ['trayMacMonochrome', 'Template'],
    fontColor: '#000000'
  },
  {
    name: ['trayMacMonochrome', 'Template@2x'],
    fontColor: '#000000'
  }
]

iconStyles.forEach(iconStyle => {
  const nameArray = typeof iconStyle.name === 'string' ? [iconStyle.name, ''] : iconStyle.name
  const fullName = nameArray.join('')
  const prefix = nameArray[0]
  const suffix = nameArray[1]
  const inputName = iconStyle.inputName || fullName
  const foregroundName = iconStyle.foregroundName || inputName
  const inputImagePath = path.join(__dirname, `../app/images/app-icons/${inputName}.png`)
  const foregroundImagePath = path.join(__dirname, `../app/images/app-icons/${foregroundName}.png`)

  let promises = []
  if (!generationMode || generationMode === 'numbers') {
    promises = Array.from({ length: 100 }, (_, k) => k).map(i => {
      const outputImagePath = path.join(__dirname, `../app/images/app-icons/${prefix}Number${i}${suffix}.png`)
      const text = i.toString()
      return overlayTextOnImage(inputImagePath, outputImagePath, text, iconStyle.fontColor, fontFamily)
    })
  }

  let progressPromises = []
  if (!generationMode || generationMode === 'progress') {
    progressPromises = Array.from({ length: 101 }, (_, k) => k).map(i => {
      const outputImagePath = path.join(__dirname, `../app/images/app-icons/${prefix}Progress${i}${suffix}.png`)
      return overlayProgressOnImage(inputImagePath, foregroundImagePath, outputImagePath, i, iconStyle.fontColor)
    })
  }

  Promise.all([...promises, ...progressPromises]).then(() =>
    console.log(`Images for theme ${fullName} processed.`)
  )
})
