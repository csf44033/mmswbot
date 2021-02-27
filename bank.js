const {MessageEmbed} = require("discord.js");
function blankBank (id) {
    return `INSERT INTO bank (id, gamesStarted, gamesFinished, gamesWon, gamesLost, gamesTied, currency) VALUES ('${id}', 0, 0, 0, 0, 0, 0)`;
};

const emptySet = {
    gamesStarted:0,
    gamesFinished:0,
    gamesWon:0,
    gamesLost:0,
    gamesTied:0,
    currency:0
};

const winMap = {
    'win': ['gamesWon', 10],
    'tie': ['gamesTied', 5],
    0: ['gamesLost', -10]
};

module.exports = class {
    gameOver(id, state, con){
        var data = winMap[state];
        this.increase(id, 'gamesFinished', 1, con);
        this.increase(id, data[0], 1, con);
        this.increase(id, 'currency', data[1], con);
    };
    getBank(id, con){
        return new Promise(resolve => {
            con.query(
                `SELECT * FROM bank WHERE id = '${id}'`, (err, rows) => {
                    if(err) throw err;
                    if(rows === void 0){
                        con.query(blankBank(id));
                        resolve([emptySet])
                    }else{
                        resolve(rows);
                    }
                }
            )});
    };
    setValue(id, index, value, con){
        con.query(`SELECT * FROM bank WHERE id = '${id}'`, (err, rows) => {
            if(err) throw err;
            let sql = blankBank(id);
            if(rows.length) sql = `UPDATE bank SET ${index} = ${value} WHERE id = '${id}'`;
            con.query(sql);
        })
    }
    increase(id, index, value, con){
        con.query(`SELECT * FROM bank WHERE id = '${id}'`, (err, rows) => {
            if(err) throw err;
            let sql = blankBank(id);
            if(rows.length) sql = `UPDATE bank SET ${index} = ${rows[0][index] + value} WHERE id = '${id}'`;
            con.query(sql);
        })
    }
    setBank(id, content, con){
        con.query(`SELECT * FROM bank WHERE id = '${id}'`, (err, rows) => {
            if(err) throw err;
            let sql = blankBank(id);
            if(rows.length) sql = `UPDATE bank SET gamesStarted=${content.gamesStarted},gamesFinished=${content.gamesFinished},gamesWon=${content.gamesWon},gamesLost=${content.gamesLost},gamesTied=${content.gamesTied},currency=${content.currency} WHERE id='${id}'`;
            con.query(sql);
        })
    }
    access (message, args, con){
        console.log('did it')
        let target = message.mentions.members.first() || (args[1]?message.members.get(args[1]):false) || message.author;
        con.query(`SELECT * FROM bank WHERE id = '${target.id}'`, (err, rows) => {
            if(err) throw err;
            let mybank = rows[0];
            if(!mybank) return message.channel.send(`${target.username} does not have a bank record.`);
            let embed = new MessageEmbed()
                .setTitle('Welcome to Your Bank')
                .setColor('#ff9600')
                .setDescription('view your game stats and currency')
                .addFields(
                    { name: 'Games started', value: "`"+mybank.gamesStarted+"`", inline: true},
                    { name: 'Games finished', value: "`"+mybank.gamesFinished+"`", inline: true},
                    { name: '\u200B', value: '\u200B' },
                    { name: 'Games won', value: "`"+mybank.gamesWon+"`", inline: true},
                    { name: 'Games tied', value: "`"+mybank.gamesTied+"`", inline: true},
                    { name: 'Games lost', value: "`"+mybank.gamesLost+"`", inline: true}
                )
                .addField('Currency', ":moneybag: "+mybank.currency, false);
            message.channel.send(embed);
        });
    };
};