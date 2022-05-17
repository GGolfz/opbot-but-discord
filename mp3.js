const YTDL = require("ytdl-core");
const fs = require("fs");
const downloadMP3 = async (url, filename) => {
    let info = await YTDL.getInfo(url.split("=")[1]);
    YTDL.downloadFromInfo(info).pipe(fs.createWriteStream(filename));
    return filename.substring(1);
}

module.exports = downloadMP3;