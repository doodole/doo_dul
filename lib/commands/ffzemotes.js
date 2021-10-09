const fetch = require('node-fetch')
const { messageSplitter } = require(`../utils.js`)

module.exports = {
    name: 'ffzemotes',
    alias: [],
    code: async (chan, chanUID, sender, senderUID, message) => {
        if (chan === 'katelynerika') { return }
        const options = {
            method: 'GET',
        }
        if (chan === 'minusinsanity') {
            const [result] = await con.promise().query(
                `SELECT isLive FROM live
                WHERE channelUID = '17497365'`
            )
            if (result[0].isLive === 'true') { return }
        }
        const res = await fetch(`https://api.frankerfacez.com/v1/room/` + chan, options)
        const data = await res.json()
        const set = data.room.set
        const emotes = data.sets[set].emoticons.map(i => i.name)
        const splitMessage = await messageSplitter(emotes, 350, "FFZ Emotes: ")
        return { say: splitMessage }
    },
    userCooldown: 60000,
    chanCooldown: 30000,
    description: `Returns the FFZ emotes for the channel you're in`,
    permissions: `global`

}