module.exports = {
    name: 'restart',
    alias: [],
    code: async (chan, chanUID, sender, senderUID, message) => {
        return { 'say': `ForsenLookingAtYou Restarting`, 'pm2': 'restart' }
    },
    userCooldown: 0,
    chanCooldown: 0,
    description: `Restart the bot`,
    permissions: `me`
}