const fetch = require("node-fetch");

module.exports = {
    name: "bttvemotes",
    alias: [],
    code: async (chan, chanUID, sender, senderUID, message) => {
        if (chan === "katelynerika") { return }
        const lentest = {}
        const options = {
            method: "GET",
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
        let n = 0
        for (i in emotes) {
            if (lentest.hasOwnProperty(n) === false) {
                lentest[n] = emotes[i]
            } else {
                if (lentest[n].length < 200) {
                    lentest[n] = lentest[n] + " " + emotes[i]
                } else {
                    n = n + 1
                    lentest[n] = emotes[i]
                }
            }
        }
        return { say: lentest }
    },
    userCooldown: 60000,
    chanCooldown: 30000,
    description: `Returns the BTTV emotes of the channel you're in`,
    permissions: `global`,
};
