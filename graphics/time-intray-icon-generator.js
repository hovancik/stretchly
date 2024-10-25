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

    console.log('Image with overlay text has been created successfully.')
  } catch (error) {
    console.error('Error creating image with overlay text:', error)
  }
}

for (let i = 0; i <= 99; i++) {
  const inputImagePath = path.join(__dirname, '../app/images/app-icons/tray.png')
  const outputImagePath = path.join(__dirname, `../app/images/app-icons/trayNumber${i}.png`)
  const text = i.toString()
  const fontSize = 27
  const fontColor = '#a6a6a6'
  const fontFamily = 'NotoSans Black'

  overlayTextOnImage(inputImagePath, outputImagePath, text, fontSize, fontColor, fontFamily)
}

for (let i = 0; i <= 99; i++) {
  const inputImagePath = path.join(__dirname, '../app/images/app-icons/trayDark.png')
  const outputImagePath = path.join(__dirname, `../app/images/app-icons/trayDarkNumber${i}.png`)
  const text = i.toString()
  const fontSize = 27
  const fontColor = '#f6f6f6'
  const fontFamily = 'NotoSans Black'

  overlayTextOnImage(inputImagePath, outputImagePath, text, fontSize, fontColor, fontFamily)
}

for (let i = 0; i <= 99; i++) {
  const inputImagePath = path.join(__dirname, '../app/images/app-icons/trayMac.png')
  const outputImagePath = path.join(__dirname, `../app/images/app-icons/trayMacNumber${i}.png`)
  const text = i.toString()
  const fontSize = 13.5
  const fontColor = '#a6a6a6'
  const fontFamily = 'NotoSans Black'

  overlayTextOnImage(inputImagePath, outputImagePath, text, fontSize, fontColor, fontFamily)
}

for (let i = 0; i <= 99; i++) {
  const inputImagePath = path.join(__dirname, '../app/images/app-icons/trayMac@2x.png')
  const outputImagePath = path.join(__dirname, `../app/images/app-icons/trayMacNumber${i}@2x.png`)
  const text = i.toString()
  const fontSize = 27
  const fontColor = '#a6a6a6'
  const fontFamily = 'NotoSans Black'

  overlayTextOnImage(inputImagePath, outputImagePath, text, fontSize, fontColor, fontFamily)
}

for (let i = 0; i <= 99; i++) {
  const inputImagePath = path.join(__dirname, '../app/images/app-icons/trayMacDark.png')
  const outputImagePath = path.join(__dirname, `../app/images/app-icons/trayMacDarkNumber${i}.png`)
  const text = i.toString()
  const fontSize = 13.5
  const fontColor = '#f6f6f6'
  const fontFamily = 'NotoSans Black'

  overlayTextOnImage(inputImagePath, outputImagePath, text, fontSize, fontColor, fontFamily)
}

for (let i = 0; i <= 99; i++) {
  const inputImagePath = path.join(__dirname, '../app/images/app-icons/trayMacDark@2x.png')
  const outputImagePath = path.join(__dirname, `../app/images/app-icons/trayMacDarkNumber${i}@2x.png`)
  const text = i.toString()
  const fontSize = 27
  const fontColor = '#f6f6f6'
  const fontFamily = 'NotoSans Black'

  overlayTextOnImage(inputImagePath, outputImagePath, text, fontSize, fontColor, fontFamily)
}

for (let i = 0; i <= 99; i++) {
  const inputImagePath = path.join(__dirname, '../app/images/app-icons/trayMonochrome.png')
  const outputImagePath = path.join(__dirname, `../app/images/app-icons/trayMonochromeNumber${i}.png`)
  const text = i.toString()
  const fontSize = 27
  const fontColor = '#f6f6f6'
  const fontFamily = 'NotoSans Black'

  overlayTextOnImage(inputImagePath, outputImagePath, text, fontSize, fontColor, fontFamily)
}

for (let i = 0; i <= 99; i++) {
  const inputImagePath = path.join(__dirname, '../app/images/app-icons/trayMonochromeInverted.png')
  const outputImagePath = path.join(__dirname, `../app/images/app-icons/trayMonochromeInvertedNumber${i}.png`)
  const text = i.toString()
  const fontSize = 27
  const fontColor = '#f6f6f6'
  const fontFamily = 'NotoSans Black'

  overlayTextOnImage(inputImagePath, outputImagePath, text, fontSize, fontColor, fontFamily)
}

for (let i = 0; i <= 99; i++) {
  const inputImagePath = path.join(__dirname, '../app/images/app-icons/trayMacMonochromeTemplate.png')
  const outputImagePath = path.join(__dirname, `../app/images/app-icons/trayMacMonochromeNumber${i}Template.png`)
  const text = i.toString()
  const fontSize = 13.5
  const fontColor = '#a6a6a6'
  const fontFamily = 'NotoSans Black'

  overlayTextOnImage(inputImagePath, outputImagePath, text, fontSize, fontColor, fontFamily)
}

for (let i = 0; i <= 99; i++) {
  const inputImagePath = path.join(__dirname, '../app/images/app-icons/trayMacMonochromeTemplate@2x.png')
  const outputImagePath = path.join(__dirname, `../app/images/app-icons/trayMacMonochromeNumber${i}Template@2x.png`)
  const text = i.toString()
  const fontSize = 27
  const fontColor = '#a6a6a6'
  const fontFamily = 'NotoSans Black'

  overlayTextOnImage(inputImagePath, outputImagePath, text, fontSize, fontColor, fontFamily)
}
