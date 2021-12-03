const fetch = require('node-fetch')
const { messageSplitter, getChannelEmotes } = require(`../utils.js`)

module.exports = {
    name: 'ffzemotes',
    alias: [],
    code: async (chan, chanUID, sender, senderUID, message) => {
        if (chan === 'katelynerika') { return }
        if (chan === 'minusinsanity') {
            const [result] = await con.promise().query(
                `SELECT isLive FROM live
                WHERE channelUID = '17497365'`
            )
            if (result[0].isLive === 'true') { return }
        }
        const channelEmotes = getChannelEmotes(chanUID)
        const ffzemotes = channelEmotes.FFZEmotes
        const splitMessage = await messageSplitter(ffzemotes, 350, "FFZ Emotes: ")
        return { say: splitMessage }
    },
    userCooldown: 60000,
    chanCooldown: 30000,
    description: `Returns the FFZ emotes for the channel you're in`,
    permissions: `global`

}