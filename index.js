require('dotenv').config();
const {Client, Intents} = require('discord.js');
const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
});

const wordList = require('./wordList.json');

const getWordListByTopic = (topic) => {
    if(topic === "random") return wordList.map(word => word.word);
    return wordList.filter(word => word.topic.toLowerCase() === topic.toLowerCase()).map(word => word.word);
}

const getWordByTopic = (topic) => {
    let wordList = getWordListByTopic(topic);
    return wordList[Math.floor(Math.random() * wordList.length)];
}

client.on('ready', () => {
    console.log('Opbot is ready !');
});

client.on('messageCreate', message => {
    let messageList = message.content.split(" ");
    let topic = "random";
    if (messageList[0] === "!fword") {
        if(!messageList[1].startsWith("<")) {
            topic = messageList[1];
            console.log(topic);
        }
    }
    let gameData = {};
    let usedWord = [];
    message.mentions.users.forEach(user => {
        let randomWord = getWordByTopic(topic);
        while(usedWord.includes(randomWord)) {
            randomWord = getWordByTopic(topic);
        }
        gameData[user.id] = {name: user.username, word: randomWord};
        usedWord.push(randomWord);
    })
    message.mentions.users.map(user => {
        let message = "";
        for(let i in gameData) {
            if(i != user.id) {
                message += gameData[i].name + ": " + gameData[i].word + "\n";
            }
        }
        user.send(message);
    })
    let time = 300;
    let sendMessage = await message.channel.send("Game started ! Time left: 5:00");
    let timer = setInterval(() => {
        time -= 1;
        let timeString = "";
        if (time > 60) {
            timeString = Math.floor(time / 60) + ":" + (time % 60);
        } else {
            timeString = time + "s";
        }
        sendMessage.edit("Game started ! Time left: " + timeString);
        if(time == 0) {
            sendMessage.edit("Game ended !");
            clearInterval(timer);
        }
    },1000)
})


client.login(process.env.DISCORDJS_BOT_TOKEN);
