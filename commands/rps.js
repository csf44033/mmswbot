const Bank = require('../bank');
const bank = new Bank();
var players = [];

const createPlayer = (id, con) => {
    players[id] = 1;
    bank.increase(id, 'gamesStarted', 1, con);
};
const gameOver = (id, state, con) => {
    bank.gameOver(id, state, con);
    delete players[id];
};

const question = 'What do you want to do? Pick from the list below and type it in the chat.\n`rock`, `paper`, `scissors`';
const answers = ['rock', 'paper', 'scissors', 'leave'];
const mapMove = ['`rock`','`paper`','`scissor`'];
module.exports = {
    name: "rps",
    description: "Play Rock Paper Scissors",
    execute(message, args, con){
        var id = message.author.id;
        if(players[id]) return message.reply('You are already playing Rock Paper Scissors!');
        createPlayer(id, con)
        var bot = Math.floor(Math.random()*3);
        message.channel.send(question).then(() => {
            message.channel.awaitMessages(m => (m.author.id === id && answers.some(answer => answer === m.content.toLowerCase())), { max: 1, time: 60000, errors: ['time'] })
                .then(collected => {
                    var content = collected.first().content;
                    var move = answers.indexOf(content);

                    if(content === 'leave'){
                        message.channel.send(`${message.author} quit the game!`);
                        return delete players[id];
                    }
                    if(move === bot) {
                        message.channel.send(`You and MMSW Bot both chose ${mapMove[bot]}.`)
                        return gameOver(id, 'tie', con);
                    }
                    if((move+1)%3===bot) {
                        message.channel.send(`You lost, ${mapMove[bot]} beats ${mapMove[move]}.`)
                        return gameOver(id, 0, con)
                    }
                    message.channel.send(`You've won, ${mapMove[move]} beats ${mapMove[bot]}!`)
                    return gameOver(id, 'win', con);
                })
                .catch(err => {
                    message.channel.send('Looks like nobody got the answer this time.');
                    return delete players[id];
                });
        });
    }
};