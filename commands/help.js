const {MessageEmbed} = require("discord.js");
const help = new MessageEmbed()
.setTitle('MMSW Bot Command List')
.setColor('#ff9600')
.setDescription('Underconstruction')
.addFields(
    {
        name: 'Ping',
        value: '`pong`',
        inline: true
    },
    {
        name: 'Map',
        value: '`creates server map`',
        inline: true
    },
    { name: '\u200B', value: '\u200B' },
    {
        name: 'Tic Tac Toe',
        value: '`&ttt <@user>`',
        inline:true
    },
    {
        name: 'Rock Paper Scissors',
        value: '`&rps`',
        inline:true
    },
    {
        name: 'Stats',
        value: '`access your stats`'
    }
);

module.exports = {
    name: "help",
    description: "display bot contents",
    execute(message, args){
        message.channel.send(help);
    }
};