const fetch = require("node-fetch");
const { messageSplitter } = require(`../utils.js`)

module.exports = {
    name: "7tvemotes",
    alias: [],
    code: async (chan, chanUID, sender, senderUID, message) => {
        if (chan === "katelynerika") { return }
        const options = {
            method: "GET",
        }
        const res = await fetch(`https://api.7tv.app/v2/users/${chan}/emotes`, options)
        const data = await res.json()
        const emotes = data.map(i => i.name)
        const splitMessage = await messageSplitter(emotes, 350, "7TV Emotes: ")
        return { say: splitMessage }
    },
    userCooldown: 60000,
    chanCooldown: 30000,
    description: `Returns the 7TV emotes of the channel you're in`,
    permissions: `global`,
};