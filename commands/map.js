const {MessageEmbed} = require("discord.js");
const serverMap = new MessageEmbed()
.setTitle('Welcome to the Server Map')
.setColor('#ff9600')
.setAuthor('GameIsRigged', 'https://vignette.wikia.nocookie.net/mms/images/b/bc/Wiki.png/revision/latest?cb=20200817020457', 'https://mms.fandom.com')
.setDescription('What are the channels for? What are the roles? Where are the hidden channels? Find out here!')
.setThumbnail('https://vignette.wikia.nocookie.net/mms/images/b/bc/Wiki.png/revision/latest?cb=20200817020457')
.addFields(
    {
        name: '━━━WELCOME━━━',
        value: '<#731329626462355526> View incoming users and welcome them to MMSW.\n<#742411127547494450> Resorces that support MMSW.'
    },
    {
        name: '━━━IMPORTANT━━━',
        value: '<#737664426127392819>New channels, categories, and personalizations!\n<#742410359360585758> Server Rules and FAQ\n<#747075983340732437> You are here!\n<#733781377618804816> Get a role using the commands below (or elsewhere).'
    },
    {
        name: "━━━GENERAL━━━",
        value: '<#733398219228315759> Chat about everyday things!\n<#742736351786434612> Make sure they are SFW.'
    },
    {
        name: "━━━VOICE━━━",
        value: '<#747069318457458759> For sharing things with other VC members, or to text chat when muted.\n**General VC** General VC for chatting with other members.\n**Gamer VC** Play games with others here.'
    }
);

module.exports = {
    name: "map",
    description: "Create server map",
    execute(message, args){
        if(!message.member.roles.cache.has('733404143838036058')) return message.reply("You do not have permission to use this command.");
        message.channel.send(serverMap);
    }
};