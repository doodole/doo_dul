const utils = require(`../utils.js`)

module.exports = {
    name: 'coinflip',
    alias: ['cf'],
    code: async (chan, chanUID, sender, senderUID, message) => {
        coin = utils.randomNum(1, 2);
        if (coin === 1) {
            return { 'say': `${sender}, Tails!` };
        } else {
            return { 'say': `${sender}, Heads!` };
        };
    },
    userCooldown: 10000,
    chanCooldown: 5000,
    description: `Flips a coin`,
    permissions: `global`
}