const { messageSplitter, getChannelEmotes } = require(`../utils.js`)

module.exports = {
    name: "7tvemotes",
    alias: [],
    code: async (chan, chanUID, sender, senderUID, message) => {
        if (chan === "katelynerika") { return }
        if (chan === 'minusinsanity') {
            const [result] = await con.promise().query(
                `SELECT isLive FROM live
                WHERE channelUID = '17497365'`
            )
            if (result[0].isLive === 'true') { return }
        }
        const channelEmotes = getChannelEmotes(chanUID)
        const seventvemotes = channelEmotes.SevenTVEmotes
        const splitMessage = await messageSplitter(seventvemotes, 350, "7TV Emotes: ")
        return { say: splitMessage }
    },
    userCooldown: 60000,
    chanCooldown: 30000,
    description: `Returns the 7TV emotes of the channel you're in`,
    permissions: `global`,
};