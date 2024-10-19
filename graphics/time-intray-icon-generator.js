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
    ctx.drawImage(image, 0, 0, image.width, image.height)

    // Set the font properties
    ctx.font = `${fontSize}px '${fontFamily}'` // Ensure font family is in quotes
    ctx.fillStyle = fontColor
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // Calculate the position to center the text
    const textX = image.width / 2
    const textY = image.height / 2

    // Draw the text onto the canvas
    ctx.fillText(text, textX, textY)

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
