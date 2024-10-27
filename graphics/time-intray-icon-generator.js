// Script to generate icons for "Time in tray" feature
// `canvas` is not installed so install it before running this script
// Run this script using `node graphics/time-intray-icon-generator.js`
const { createCanvas, loadImage, registerFont } = require('canvas')
const fs = require('fs')
const path = require('path')

// Load the font (make sure the font file is available in your project directory)
registerFont(path.join(__dirname, '../app/css/fonts/NotoSans-Black.ttf'), { family: 'NotoSans Black' })

async function overlayTextOnImage (inputImagePath, outputImagePath, text, fontSize, fontColor, fontFamily) {
  try {
    // Load the input image
    const image = await loadImage(inputImagePath)

    // Create a canvas with the same dimensions as the input image
    const canvas = createCanvas(image.width, image.height)
    const ctx = canvas.getContext('2d')

    // Draw the input image onto the canvas
    ctx.drawImage(image, 0, 0)

    // Set the font properties
    const maxTextWidthRatio = 0.8
    ctx.quality = 'best'
    ctx.font = `${fontSize}px '${fontFamily}'`
    ctx.fillStyle = fontColor
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // Calculate the position to center the text
    const textMetrics = ctx.measureText(text)
    // Offset the text, so the drawn text is vertically centered, not its baseline
    const verticalOffsetFix = (textMetrics.actualBoundingBoxAscent - textMetrics.actualBoundingBoxDescent) / 2
    const textX = image.width / 2
    const textY = image.height / 2 + verticalOffsetFix
    const textWidth = textMetrics.width
    const textHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent

    // Create cutout for text
    ctx.globalCompositeOperation = 'destination-out'
    const paddingX = 3
    const paddingY = 4
    const radiusX = textWidth / 2 + paddingX
    const radiusY = textHeight / 2 + paddingY
    ctx.beginPath()
    ctx.ellipse(
      textX,
      image.height / 2,
      radiusX,
      radiusY,
      0, 0, 2 * Math.PI
    )
    ctx.fill()

    // Draw the text onto the canvas
    ctx.globalCompositeOperation = 'source-over'
    ctx.fillStyle = fontColor
    ctx.fillText(text, textX, textY, maxTextWidthRatio * image.width)

    // Convert the canvas to a buffer
    const buffer = canvas.toBuffer('image/png')

    // Save the output image
    fs.writeFileSync(outputImagePath, buffer)
  } catch (error) {
    console.error('Error creating image with overlay text:', error)
  }
}

const fontFamily = 'NotoSans Black';
[
  {
    name: 'tray',
    fontColor: '#a6a6a6',
    fontSize: 27
  },
  {
    name: 'trayDark',
    fontColor: '#f6f6f6',
    fontSize: 27
  },
  {
    name: 'trayMonochrome',
    fontColor: '#f6f6f6',
    fontSize: 27
  },
  {
    name: 'trayMonochromeInverted',
    fontColor: '#f6f6f6',
    fontSize: 27
  },
  {
    name: 'trayMac',
    fontColor: '#a6a6a6',
    fontSize: 13.5
  },
  {
    name: ['trayMac', '@2x'],
    fontColor: '#a6a6a6',
    fontSize: 27
  },
  {
    name: 'trayMacDark',
    fontColor: '#f6f6f6',
    fontSize: 13.5
  },
  {
    name: ['trayMacDark', '@2x'],
    fontColor: '#f6f6f6',
    fontSize: 27
  },
  {
    name: ['trayMacMonochrome', 'Template'],
    fontColor: '#a6a6a6',
    fontSize: 13.5
  },
  {
    name: ['trayMacMonochrome', 'Template@2x'],
    fontColor: '#a6a6a6',
    fontSize: 27
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
    return overlayTextOnImage(inputImagePath, outputImagePath, text, iconStyle.fontSize, iconStyle.fontColor, fontFamily)
  })

  Promise.all(promises).then(() =>
    console.log(`Images for theme ${fullName} with overlay text have been processed.`)
  )
})
