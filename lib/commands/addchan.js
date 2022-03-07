const { getBestAvailableEmote } = require(`../utils.js`)

module.exports = {
    name: 'addchan',
    alias: [],
    code: async (chan, chanUID, sender, senderUID, message) => {
        if (message[1] === undefined) {
            return { 'say': `doodole_, Do you plan on joining a person ${getBestAvailableEmote(['ForsenLookingAtYou', 'Stare'], ':\\')}` };
        } else {
            utils.client.join(message[1])
            return { 'say': `${message[1]}'s channel was joined!` };
        }
    },
    userCooldown: 0,
    chanCooldown: 0,
    description: `Add a channel`,
    permissions: `me`
}