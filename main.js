const {prefix, token, url} = require('./config.json');
const Discord = require("discord.js");
const fs = require("fs");

const dbFile = "./.data/sqlite.db";
const exists = fs.existsSync(dbFile);
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database(dbFile);

db.serialize(() => {
  if (!exists) {
    db.run(
      "CREATE TABLE bank (id, gamesStarted, gamesFinished, gamesWon, gamesLost, gamesTied, currency)"
    );
    console.log("connected");
  }else {
    console.log('Database "bank" ready to go!');
  }
});

const client = new Discord.Client();
client.login(token);

client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync("./commands").filter(file=>file.endsWith(".js"));
for(let file of commandFiles){
    let command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

client.once('ready', e => {
    console.log('mmsw bot is online');
});

client.on('message', message => {
    var categoryID = message.channel.parentID;
    if(categoryID===733397956354637875||categoryID===747069163234656306){
        message.delete(86400000);
    }
    //Don't care about bots
    if(!message.content.startsWith(prefix)||message.author.bot) return;

    //remove prefix, text to lower case, remove white space, split at spaces
    var args = message.content.slice(prefix.length).trim().split(/ +/);
    var commandName = args.slice().shift().toLowerCase();
    
    if(!commandName.length) return message.reply("You have not provided any arguments");
    if(!client.commands.has(commandName)) return;
    var command = client.commands.get(commandName);

    try{
        command.execute(message, args, db);
    }catch(error){
        console.error(error);
        message.reply("There was an issue executing that command!");
    }
});
