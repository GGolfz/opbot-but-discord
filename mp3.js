const YTDL = require("ytdl-core");
const fs = require("fs");
const downloadMP3 = async (url, filename) => {
    let info = await YTDL.getInfo(url.split("=")[1]);
    console.log("Downloading: ",filename)
    return new Promise((resolve, reject) => {
        YTDL.downloadFromInfo(info).pipe(fs.createWriteStream(filename)).on("finish", () => {
            resolve(filename.substring(1));
        })
    })
}

module.exports = downloadMP3;