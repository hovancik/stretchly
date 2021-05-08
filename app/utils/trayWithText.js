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
      mergeImg([
        {src: imagePath},
        {
          src: pathToImages +minutesOnTray + ".png",
          offsetX: -32,
        },
      ]).then((img) => {
        // Save image as file
        img.write(pathToImages + "out.png", () => console.log("done"));
      });
    } else{
      minutesOnTray=""+minutesToLongBreak+"";
      if (minutesToLongBreak > 99) minutesOnTray = "99";
          mergeImg([
        {src: imagePath},
        {
          src: pathToImages +"01" + ".png",
          offsetX: -32,
        },
      ]).then((img) => {
        // Save image as file
        img.write(pathToImages + "out.png", () => console.log("done"));
      });
    }
    
    // return mergeImages([
    //   imagePath,
    //   "/home/m/p/stretchly/app/images/app-icons/trayMac.png",
    // ]).then((b64) => this.setImage(b64));
  };
}

module.exports = TrayWithText;