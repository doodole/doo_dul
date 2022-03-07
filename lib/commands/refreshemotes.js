const { updateChannelEmotes } = require(`../utils.js`)

module.exports = {
    name: "refreshemotes",
    alias: [],
    code: async (chan, chanUID, sender, senderUID, message) => {
        updateChannelEmotes(chan, chanUID)
        return { say: `${sender}, Emotes have been refreshed :)` }
    },
    userCooldown: 0,
    chanCooldown: 0,
    description: `Allows you to manually refresh your channel's emotes`,
    permissions: `mods`,
};