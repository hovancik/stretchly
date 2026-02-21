// Script to generate icons for "Time in tray" feature
// `canvas` is not installed so install it before running this script
// Run this script using `node graphics/time-intray-icon-generator.js`
// You can optionally pass an argument to generate only specific icons:
// `node graphics/time-intray-icon-generator.js numbers`
// `node graphics/time-intray-icon-generator.js progress`
import { createCanvas, loadImage, registerFont } from 'canvas'
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

    // Force high contrast colors for numbers
    const highContrastColor = fontColor === '#8c8c8c' ? '#ffffff' : fontColor
    ctx.fillStyle = highContrastColor

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

async function overlayProgressOnImage (inputImagePath, outputImagePath, percentage, fontColor) {
  try {
    const baseImage = await loadImage(inputImagePath)
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
    ctx.drawImage(baseImage, 0, 0, imageWidth, imageHeight)
    ctx.restore()

    const buffer = canvas.toBuffer('image/png')
    fs.writeFileSync(outputImagePath, buffer)
  } catch (error) {
    console.error('Error creating image with overlay progress:', error)
  }
}

const fontFamily = 'Noto Sans Regular'
const generationMode = process.argv[2]

const iconStyles = [
  {
    name: 'tray',
    fontColor: '#000000'
  },
  {
    name: 'trayDark',
    fontColor: '#8c8c8c'
  },
  {
    name: 'trayMonochrome',
    fontColor: '#000000',
    fontSize: 25.5
  },
  {
    name: 'trayMonochromeInverted',
    fontColor: '#8c8c8c'
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
    fontColor: '#8c8c8c'
  },
  {
    name: ['trayMacDark', '@2x'],
    fontColor: '#8c8c8c'
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
  const inputImagePath = path.join(__dirname, `../app/images/app-icons/${fullName}.png`)

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
      return overlayProgressOnImage(inputImagePath, outputImagePath, i, iconStyle.fontColor)
    })
  }

  Promise.all([...promises, ...progressPromises]).then(() =>
    console.log(`Images for theme ${fullName} processed.`)
  )
})
