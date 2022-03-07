const utils = require(`../utils.js`)

module.exports = {
    name: 'partchan',
    alias: [],
    code: async (chan, chanUID, sender, senderUID, message) => {
        if (message[1] === undefined) {
            return { 'say': `doodole_, Do you plan on leaving a channel? ${utils.getBestAvailableEmote(['ForsenLookingAtYou', 'Stare'], ':Z')}` };
        }
        else {
            utils.client.part(message[1])
            return { 'say': `Cya ${message[1]}` };
        }
    },
    userCooldown: 0,
    chanCooldown: 0,
    description: `Leave a channel`,
    permissions: `me`
}