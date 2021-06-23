const utils = require(`../utils.js`)
const fetch = require('node-fetch')

module.exports = {
    name: 'accountage',
    alias: ['accage', 'aa'],
    code: async (chan, chanUID, sender, senderUID, message) => {
        if (message[1] === undefined) {
            const options = {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + utils.AT,
                    'Client-ID': process.env.CLIENTID,
                }
            }
            const res = await fetch(encodeURI(`https://api.twitch.tv/helix/users?login=` + sender), options)
            const data = await res.json()
            if (data.status === 400) { return { 'say': `${sender}, That user doesn't exist :)` } }
            if (!data.data.length) { return { 'say': `${sender}, This user couldn't be found :)` } }
            const elapsed = await utils.time(data.data[0].created_at)
            return { 'say': `${sender}, Your account was created ${elapsed} ago` }
        }
        const user = message[1].toLowerCase()
        {
            const options = {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + utils.AT,
                    'Client-ID': process.env.CLIENTID,
                }
            }
            const res = await fetch(encodeURI(`https://api.twitch.tv/helix/users?login=` + user), options)
            const data = await res.json()
            if (data.status === 400) { return { 'say': `${sender}, That user doesn't exist :)` } }
            if (!data.data.length) { return { 'say': `${sender}, This user couldn't be found :)` } }
            const elapsed = await utils.time(data.data[0].created_at)
            return { 'say': `${sender}, ${data.data[0].display_name}'s account was created ${elapsed} ago` }
        }
    },
    userCooldown: 10000,
    chanCooldown: 0,
    description: `Returns the account age of a user. Example: *accountage (for the sender) or *accountage doodole_`,
    permissions: `global`
}