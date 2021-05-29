module.exports = {
    name: 'clear',
    alias: [],
    code: async (chan, chanUID, sender, senderUID, message) => {
        return {'privmsg': `/clear`, 'say': `Transparent chat forsenCD`}
    },
    userCooldown : 0,
    chanCooldown : 0,
    description : `Clears the chat`,
    permissions: `mods`
}