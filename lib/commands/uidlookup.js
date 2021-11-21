const utils = require(`../utils.js`)
const fetch = require('node-fetch')

module.exports = {
    name: 'uidlookup',
    alias: ['uid'],
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
            if (data.status === 401) {
                utils.AT = await utils.getToken();
                return this.code(chan, chanUID, sender, senderUID, message);
            }
            if (!data.data.length) { return { 'say': `${sender}, This user couldn't be found :)` } }

            return { 'say': `${sender}, your user ID is ${data.data[0].id}` };
        }
        const arg = message[1].toLowerCase()
        {
            const options = {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + utils.AT,
                    'Client-ID': process.env.CLIENTID,
                }
            }
            const res = await fetch(encodeURI(`https://api.twitch.tv/helix/users?login=` + arg), options)
            const data = await res.json()
            if (data.data.length) { return { 'say': `${sender}, The user ID of that user is ${data.data[0].id}` }; }
        }
        {
            const options = {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + utils.AT,
                    'Client-ID': process.env.CLIENTID,
                }
            }
            const res = await fetch(encodeURI(`https://api.twitch.tv/helix/users?id=` + arg), options)
            const data = await res.json()
            if (data.status === 400) { return { 'say': `${sender}, That user doesn't exist :)` } }
            if (data.status === 401) {
                utils.AT = await utils.getToken();
                return this.code(chan, chanUID, sender, senderUID, message);
            }
            if (!data.data.length) { return { 'say': `${sender}, This user couldn't be found :)` } }
            return { 'say': `${sender}, That uid belongs to ${data.data[0].display_name}` };
        }
    },
    userCooldown: 10000,
    chanCooldown: 0,
    description: `Returns a username or ID based on the input. Example: *uidlookup 123 or *uidlookup doodole_`,
    permissions: `global`
}