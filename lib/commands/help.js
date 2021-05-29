module.exports = {
    name: 'help',
    alias: ['commands'],
    code: async (chan, chanUID, sender, senderUID, message) => {
        return {'say': 'Here is a list of all the commands for the bot: https://doodul.xyz/commands'}
    },
    userCooldown : 60000,
    chanCooldown : 60000,
    description : `Sends user to this list of commands`,
    permissions: `global`
}