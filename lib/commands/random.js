const utils = require(`../utils.js`)

module.exports = {
    name: 'random',
    alias: ['r', 'randomnum'],
    code: async (chan, chanUID, sender, senderUID, message) => {
        randomnum = utils.randomNum(1, message[1]);
        if (message[1] === undefined) {
            return { say: `${sender}, Please input a number from 1 to 100000 :)` };
        }
        else if (message[1] <= 0) {
            return { say: `${sender}, You can only input positive numbers ${utils.getBestAvailableEmote(['ForsenLookingAtYou', 'Stare'], ':)')}` };
        }
        else if (message[1].match(/^[0-9]+$/) === null) {
            return { say: `${sender}, Why are you trying to input letters ${utils.getBestAvailableEmote(['ForsenLookingAtYou', 'Stare'], ':Z')}` };
        }
        else if (message[1] > 100000) {
            return { say: `${sender}, You can only input at most 100000 ${utils.getBestAvailableEmote(['ForsenLookingAtYou', 'Stare'], ':)')}` };
        }
        else if (randomnum === 1 && message[1] === `1`) {
            return { say: `${sender}, You got ` + randomnum + `, what did you expect? ${utils.getBestAvailableEmote(['ForsenLookingAtYou', 'Stare'], 'LUL')}` };
        }
        else if (randomnum === 69) {
            return { say: `${sender}, You got ` + randomnum + `, nice!` };
        }
        else {
            return { say: `${sender}, You got ` + randomnum + `!` };
        };
    },
    userCooldown: 10000,
    chanCooldown: 5000,
    description: `Gives a random number from 1 to 100000. Usage: *random [number] ex. *random 10`,
    permissions: `global`
}