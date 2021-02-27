const Bank = require("../bank");
const bank = new Bank();

module.exports = {
    name: "stats",
    description: "show user's stats",
    execute(message, args, con){
        bank.access(message, args, con);
    }
};