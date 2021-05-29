module.exports = {
    name: 'shutdown',
    alias: [],
    code: async (chan, chanUID, sender, senderUID, message) => {
        return {'say': `Cya Later PepeHands`, 'pm2':'shutdown'}
    },
    userCooldown : 0,
    chanCooldown : 0,
    description : `Shutdown the bot`,
    permissions: `me`
}