const {prefix, token} = require('./config.json');
const Discord = require("discord.js");
const fs = require("fs");
const mysql = require('mysql2');
 
// create the connection to database
const connection = mysql.createConnection({
    password: 'jp021202',
    host: 'localhost',
    user: 'root',
    database: 'sad'
});

// simple query
connection.connect(err=>{
    if(err)throw err;
    console.log('connected database');
})

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
    //Don't care about bots
    if(!message.content.startsWith(prefix)||message.author.bot) return;

    //remove prefix, text to lower case, remove white space, split at spaces
    var args = message.content.slice(prefix.length).trim().split(/ +/);
    var commandName = args.slice().shift().toLowerCase();
    
    if(!commandName.length) return message.reply("You have not provided any arguments");
    if(!client.commands.has(commandName)) return;
    var command = client.commands.get(commandName);

    try{
        command.execute(message, args, connection);
    }catch(error){
        console.error(error);
        message.reply("There was an issue executing that command!");
    }
});