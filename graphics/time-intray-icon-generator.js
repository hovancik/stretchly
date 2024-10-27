// Script to generate icons for "Time in tray" feature
// `canvas` is not installed so install it before running this script
// Run this script using `node graphics/time-intray-icon-generator.js`
const { createCanvas, loadImage, registerFont } = require('canvas')
const fs = require('fs')
const path = require('path')

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

    // Draw the input image onto the canvas
    ctx.drawImage(baseImage, 0, 0, imageWidth, imageHeight)

    // Set the font properties
    const textHeightRatio = 0.8
    const maxTextWidthRatio = 0.8
    ctx.quality = 'best'
    ctx.font = `${textHeightRatio * imageHeight}px '${fontFamily}'`
    ctx.fillStyle = fontColor
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // Calculate the position to center the text
    const textMetrics = ctx.measureText(text)
    // Offset the text, so the drawn text is vertically centered, not its baseline
    const verticalOffsetFix = (textMetrics.actualBoundingBoxAscent - textMetrics.actualBoundingBoxDescent) / 2
    const textX = imageWidth / 2
    const textY = imageHeight / 2 + verticalOffsetFix
    const textWidth = textMetrics.width
    const textHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent

    // Create cutout for text
    ctx.globalCompositeOperation = 'destination-out'
    const paddingX = 4
    const paddingY = 4
    const radiusX = textWidth / 2 + paddingX
    const radiusY = textHeight / 2 + paddingY
    ctx.beginPath()
    ctx.ellipse(
      textX,
      imageHeight / 2,
      radiusX,
      radiusY,
      0, 0, 2 * Math.PI
    )
    ctx.fill()

    // Draw the text onto the canvas
    ctx.globalCompositeOperation = 'source-over'
    ctx.fillStyle = fontColor
    ctx.fillText(text, textX, textY, maxTextWidthRatio * imageWidth)

    // Convert the canvas to a buffer
    const buffer = canvas.toBuffer('image/png')

    // Save the output image
    fs.writeFileSync(outputImagePath, buffer)
  } catch (error) {
    console.error('Error creating image with overlay text:', error)
  }
}

const fontFamily = 'Noto Sans Regular';
[
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
].forEach(iconStyle => {
  const nameArray = typeof iconStyle.name === 'string' ? [iconStyle.name, ''] : iconStyle.name
  const fullName = nameArray.join('')
  const prefix = nameArray[0]
  const suffix = nameArray[1]
  const inputImagePath = path.join(__dirname, `../app/images/app-icons/${fullName}.png`)
  const promises = Array.from({ length: 100 }, (_, k) => k).map(i => {
    const outputImagePath = path.join(__dirname, `../app/images/app-icons/${prefix}Number${i}${suffix}.png`)
    const text = i.toString()
    return overlayTextOnImage(inputImagePath, outputImagePath, text, iconStyle.fontColor, fontFamily)
  })

  Promise.all(promises).then(() =>
    console.log(`Images for theme ${fullName} with overlay text have been processed.`)
  )
})
