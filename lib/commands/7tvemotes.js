const fetch = require("node-fetch");

module.exports = {
    name: "7tvemotes",
    alias: [],
    code: async (chan, chanUID, sender, senderUID, message) => {
        if (chan === "katelynerika") { return }
        const lentest = {}
        const options = {
            method: "GET",
        }
        const res = await fetch(`https://api.7tv.app/v2/users/${chan}/emotes`, options)
        const data = await res.json()
        const emotes = data.map(i => i.name)
        let n = 0
        for (i in emotes) {
            if (!lentest.hasOwnProperty(n)) {
                lentest[n] = `7TV Emotes: ` + emotes[i]
            } else {
                if (lentest[n].length < 350) {
                    lentest[n] = lentest[n] + " " + emotes[i]
                } else {
                    n = n + 1
                    lentest[n] = `7TV Emotes: ` + emotes[i]
                }
            }
        }
        return { say: lentest }
    },
    userCooldown: 60000,
    chanCooldown: 30000,
    description: `Returns the 7TV emotes of the channel you're in`,
    permissions: `global`,
};