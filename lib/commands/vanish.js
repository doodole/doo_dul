module.exports = {
    name: 'vanish',
    alias: [],
    code: async (chan, chanUID, sender, senderUID, message) => {
        return {'privmsg': `/timeout ${sender} 1 forsenCD`};
    },
    userCooldown : 30000,
    chanCooldown : 0,
    description : `Timesout the user for 1 second`,
    permissions: `global`
}