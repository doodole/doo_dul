const fetch = require("node-fetch");
const { messageSplitter } = require(`../utils.js`)

module.exports = {
    name: "bttvemotes",
    alias: [],
    code: async (chan, chanUID, sender, senderUID, message) => {
        if (chan === "katelynerika") { return }
        const options = {
            method: "GET",
        }
        if (chan === 'minusinsanity') {
            const [result] = await con.promise().query(
                `SELECT isLive FROM live
                WHERE channelUID = '17497365'`
            )
            if (result[0].isLive === 'true') { return }
        }
        const res = await fetch(`https://api.betterttv.net/3/cached/users/twitch/` + chanUID, options)
        const data = await res.json()
        const emotes = []
        for (i in data.channelEmotes) {
            emotes.push(data.channelEmotes[i].code)
        }
        for (i in data.sharedEmotes) {
            emotes.push(data.sharedEmotes[i].code)
        }
        const splitMessage = await messageSplitter(emotes, 350, "BTTV Emotes: ")
        return { say: splitMessage }
    },
    userCooldown: 60000,
    chanCooldown: 30000,
    description: `Returns the BTTV emotes of the channel you're in`,
    permissions: `global`,
};
