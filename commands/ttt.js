const {MessageEmbed} = require("discord.js");
const Bank = require('../bank');
const bank = new Bank();
var players = [];

const actions = ['1','2','3','4','5','6','7','8','9','leave'];
const actionMap = {'1':4,'2':2,'3':1,'4':32,'5':16,'6':8,'7':256,'8':128,'9':64};

function createPlayer(id, content, con){
    players[id] = content;
    bank.increase(id, 'gamesStarted', 1, con);
}
function gameOver (id, state, con){
    bank.gameOver(id, state, con);
    delete players[id];
};

function taken (map, move){
    return (map|move) === map;
};
function checkWinner (p1, p2){
    //if diagonal victory
    if((p1&273)===273||(p1&84)===84){
        return 'win';
    }
    //check verticle and horizontal victories
    for(var n = 0; n < 3; n ++){
        var h = 7 * (1 << 3*n);
        var v = 73 * (1 << n);
        //if verticle or horizontal victory
        if((p1&h)===h||(p1&v)===v){
            return 'win';
        }
    }
    //if map is full
    if((p1|p2)===511){
        return 'tie';
    }
    return false;
};
function createMap (p1,p2){
    var x = ':x:';
    var o = ':o:';
    var n = ':black_square_button:';
    var message = "";
    for(var power = 9; power --;){
        if(power!==9&&(power+1)%3===0) message += "\n";
        //check if bit is ON
        if(p1 >> power & 1) message += x;
        else if(p2 >> power & 1) message += o;
        else message += n;
    }
    return new MessageEmbed()
        .setTitle('Tic Tac Toe')
        .setColor('#ff9600')
        .setDescription(message);
};
function checkMap (username, message, m1, m2, id, pid, con){
    switch(checkWinner(m1,m2)){
        case 'win':
            if(id) gameOver(id, 'win', con);
            if(pid) gameOver(pid, 0, con);
            message.channel.send(new MessageEmbed()
                .setTitle(`${username} Won!`)
                .setColor('#ff9600')
                .setDescription("GG everyone"));
        return true;
        case 'tie':
            if(id) gameOver(id, 'tie', con);
            if(pid) gameOver(pid, 'tie', con);
            message.channel.send(new MessageEmbed()
                .setTitle('No One Won :cowboy:')
                .setColor('#ff9600')
                .setDescription('GG everyone'));
        return true;
    }
    return false;
};
function minimax (p1, p2, available, maxamizing){
    switch(checkWinner(p1, p2)){
        case 'win':
        return 1 - (maxamizing<<1);
        case 'tie':
        return 0;
    }
    if(maxamizing){
        let bestScore = -Infinity;
        for(var i = 0; i < available.length; i ++){
            var twin = available.slice();
            twin.splice(i, 1);
            bestScore = Math.max(minimax((p2|available[i]), p1, twin, false), bestScore);
        }
        return bestScore;
    }else{
        let bestScore = Infinity;
        for(var i = 0; i < available.length; i ++){
            var twin = available.slice();
            twin.splice(i, 1);
            bestScore = Math.min(minimax((p2|available[i]), p1, twin, true), bestScore);
        }
        return bestScore;
    }
};

function game (message, id, move, con){

    //get player by id
    var p1 = players[id];

    //if multiplayer
    if(p1.bot === void 0){

        //locate player2
        var pid = p1.vs;
        var p2 = players[pid];

        //locate moves
        var m = move;
        var m1 = p1.moves;
        var m2 = p2.moves;
        var map = m1|m2;

        //if space is taken
        if(taken(map, m)) return gameCatch(message, id, `${message.author}, You can't move there!`, con);

        //move player1
        p1.moves|=m;
        m1=p1.moves;

        //create map
        if(p1.foe) map = createMap(m2, m1);
        else map = createMap(m1, m2);

        if(checkMap(message.author.username,message,m1,m2,id,pid, con)) return message.channel.send(map);

        //switch turns
        players[id] = p1;
        players[pid] = p2;
        gameCatch(message, pid, map, con)
    }else{
        //locate moves
        var m = move;
        var m1 = p1.moves;
        var m2 = p1.bot;
        var map = m1|m2;

        //if space is taken
        if(taken(map, m)) return gameCatch(message, id, `${message.author}, You can't move there!`, con);

        //move player1
        p1.anti.splice(p1.anti.indexOf(m), 1);
        p1.moves|=m;
        m1=p1.moves;

        //create map
        map = createMap(m2, m1);
        if(checkMap(message.author.username, message, m1, m2, id, false, con)) return message.channel.send(map);
        message.channel.send(map);

        var bestScore = -Infinity, bestMove;

        //test all available spaces
        for(var i = 0; i < p1.anti.length; i ++){
            //remove space from a shallow copy
            var twin = p1.anti.slice();
            twin.splice(i, 1);

            //minimax algorithm
            var score = minimax((m2|p1.anti[i]), m1, twin, false);

            //a larger number represents the best case
            if(score > bestScore){
                bestScore = score;
                bestMove = i;
            }
        }

        //cache the move
        m = p1.anti[bestMove];

        //remove step from viable spaces
        p1.anti.splice(bestMove,1);

        //move the bot
        p1.bot|=m;
        m2=p1.bot;

        //create map
        if(checkWinner(m2,m1)){
            message.channel.send(createMap(m2, m1));
            //username, message, m1, m2, id, pid, con
            return checkMap("MMSW Bot", message, m2, m1, false, id, con);
        }
        players[id] = p1;
        gameCatch(message, id, createMap(m2, m1), con);
    }
};

function gameCatch (message, id, map, con){
    message.channel.send(map).then(() => {
        message.channel.awaitMessages(m => (m.author.id === id && actions.some(answer => answer === m.content.toLowerCase())), { max: 1, time: 60000, errors: ['time'] })
            .then(collected => {
                var content = collected.first().content;

                if(content === 'leave'){
                    message.channel.send(`${author} quit the game!`);
                    return delete players[id];
                }

                return game(message, id, actionMap[content], con);
            })
            .catch(collected => {
                delete players[id];
                message.channel.send('Looks like nobody got the answer this time.');
            });
    }); 
};

module.exports = {
    name: "ttt",
    description: "Play Tic Tac Toe",
    execute(message, args, con){

        //Check if player can start a game
        var id = message.author.id;
        if(players[id] !== void 0) return message.reply("You are already playing Tic Tac Toe!");

        //solo match
        if(args.length === 1){
            var m = 1 << Math.floor(Math.random()*9);
            var anti = [];
            for(var i = 0; i < 9; i ++){
                if(1<<i===m) continue;
                anti.push(1<<i);
            }
            createPlayer(id, {moves: 0, bot: m, anti: anti}, con);
            gameCatch(message, id, createMap(m,0), con);
            return;
        }

        let target = message.mentions.members.first() || message.members.get(args[1]);
        if(target === void 0) return message.reply("You have to @ an actual person!");
        if(target.user.bot) return message.reply("You can't play Tic Tac Toe with a bot");

        var pid = target.id;
        if(pid === id) return message.reply("You can't play yourself!");
        if(players[pid] !== void 0) return message.reply(`${target.username} is in midgame.`);

        createPlayer(pid, {moves: 0, vs: id}, con);
        createPlayer(id, {moves: 0, vs: pid}, con);
        gameCatch(message, pid, createMap(0,0), con);
    }
};