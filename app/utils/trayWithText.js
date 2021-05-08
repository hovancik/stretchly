const {Tray} = require('electron')
const mergeImg = require("merge-img");
const pathToImages = "app/images/app-icons/numbers/";

class TrayWithText extends Tray {
//   constructor(image: NativeImage | string, guid?: string) {
//     super.constructor(image, guid);
//   }
  //
  showWithNumber=async function(imagePath, minutesToLongBreak) {
    let minutesOnTray="00";
    if(minutesToLongBreak<10){
      minutesOnTray="0"+minutesToLongBreak;
      await mergeImg([
        {src: imagePath},
        {
          src: pathToImages +minutesOnTray + ".png",
          offsetX: -32,
        },
      ]).then((img) => {
        img.write(pathToImages + "out.png", () => console.debug("done"));
      });
    } else{
        let lastDigit = minutesToLongBreak % 10;
        minutesOnTray = Math.floor((minutesToLongBreak / 10) % 10);
      await mergeImg([
        {src: pathToImages + minutesOnTray + ".png"},
        {
          src: pathToImages + lastDigit + ".png",
          // offsetX: -32,
        },
      ]).then((img) => {
        img.write(pathToImages + "twoDigitNumber.png", () => console.debug("done numbCreation"));
    });
       await mergeImg([
         {src: imagePath},
         {
           src: pathToImages + "twoDigitNumber.png",
           offsetX: -32,
         },
       ]).then((img) => {
         img.write(pathToImages + "out.png", () => console.debug("done"));
       });
    }
  };
}

module.exports = TrayWithText;