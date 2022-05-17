require("dotenv").config();
const { Client, Intents } = require("discord.js");
const { joinVoiceChannel, createAudioPlayer,createAudioResource, AudioPlayerStatus } = require("@discordjs/voice");
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES],
});
const downloadMP3 = require("./mp3");
const wordList = require("./wordList.json");
var queue = [];
var audioPlayer;

const getWordListByTopic = (topic) => {
  if (topic === "random") return wordList.map((word) => word.word);
  return wordList
    .filter((word) => word.topic.toLowerCase() === topic.toLowerCase())
    .map((word) => word.word);
};

const getWordByTopic = (topic) => {
  let wordList = getWordListByTopic(topic);
  return wordList[Math.floor(Math.random() * wordList.length)];
};

client.on("ready", () => {
  console.log("Opbot is ready !");
});

client.on("messageCreate", async (message) => {
  if (message.content.startsWith("!")) {
    let messageList = message.content.split(" ");
    let topic = "random";
    if (messageList[0] === "!fword") {
      if (!messageList[1].startsWith("<")) {
        topic = messageList[1];
        console.log(topic);
      }
      let gameData = {};
      let usedWord = [];
      message.mentions.users.forEach((user) => {
        let randomWord = getWordByTopic(topic);
        while (usedWord.includes(randomWord)) {
          randomWord = getWordByTopic(topic);
        }
        gameData[user.id] = { name: user.username, word: randomWord };
        usedWord.push(randomWord);
      });
      message.mentions.users.map((user) => {
        let message = "";
        for (let i in gameData) {
          if (i != user.id) {
            message += gameData[i].name + ": " + gameData[i].word + "\n";
          }
        }
        user.send(message);
      });
      let time = 300;
      let sendMessage = await message.channel.send(
        "Game started ! Time left: 5:00"
      );
      let timer = setInterval(() => {
        time -= 5;
        let timeString = "";
        if (time > 60) {
          timeString = Math.floor(time / 60) + ":" + (time % 60);
        } else {
          timeString = time + "s";
        }
        sendMessage.edit("Game started ! Time left: " + timeString);
        if (time == 0) {
          sendMessage.edit("Game ended !");
          clearInterval(timer);
        }
      }, 5000);
    } else if (messageList[0] === "!play") {
      if (message.member.voice.channel) {
        if (queue.length == 0) {
          queue.push(messageList[1]);
          let connection = await joinVoiceChannel({
            channelId: message.member.voice.channel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator,
          });
          await play(connection, message);
        } else {
          queue.push(messageList[1]);
        }
      } else {
        message.reply("You must be in a voice channel to play a music !");
      }
    } else if(messageList[0] === "!stop"){
      if(audioPlayer){
        audioPlayer.stop();
      }
    }
  }
});

const play = async (connection, message) => {
  let resource = await downloadMP3(queue[0], "./music/" + queue[0].split("=")[1] + ".mp3");
  setTimeout(async () => {
    let audioResource = await createAudioResource("/Users/ggolfz/Desktop/opbot-but-discord" + resource);
    audioPlayer = createAudioPlayer();
    
    audioPlayer.on(AudioPlayerStatus.Playing, () => {
      console.log("playing");
      message.reply(`:thumbsup: Now Playing ***${message.content.split(" ")[1]}***`)
    })
    audioPlayer.on(AudioPlayerStatus.Idle, () => {
      if(queue.length > 0){
        queue.shift();
        play(connection, message);
      }
    })
    audioPlayer.on("error", (error) => {
      console.log(error);
    })
    audioPlayer.play(audioResource);
    subscription = connection.subscribe(audioPlayer);
  }, 2000)
  

};

client.login(process.env.DISCORDJS_BOT_TOKEN);
