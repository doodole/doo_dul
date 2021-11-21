const fetch = require('node-fetch')
const utils = require(`../utils`)

module.exports = {
    name: 'followage',
    alias: ['fa'],
    code: async (chan, chanUID, sender, senderUID, message) => {
        const getFollowers = async (url) => {
            const options = {
                method: 'GET',
                headers: {
                    'Client-ID': process.env.CLIENTID,
                    'Authorization': 'Bearer ' + utils.AT
                },
            }
            const res = await fetch(encodeURI(url), options)
            const status = await res.status;
            console.log(`Status: ${status}`);
            if (status === "401") {
                utils.AT = await utils.getToken()
                return getFollowers(url)
            }
            return res.json()
        }
        if (message[1] === undefined) {
            const data = await getFollowers(encodeURI(`https://api.twitch.tv/helix/users/follows?` + `from_id=${senderUID}&to_id=${chanUID}`))
            if (data.data[0] === undefined) {
                return { 'say': `You aren't following this channel ForsenLookingAtYou` }
            }
            const elapsed = await utils.time(data.data[0].followed_at)
            return { 'say': `${sender}, You have been following ${chan} for ${elapsed}` };
        } if (message[2] === undefined) {
            const UID = await utils.getUID(message[1].toLowerCase())
            if (UID === undefined) { return { 'say': `ForsenLookingAtYou That isn't a real user` } }
            const data = await getFollowers(encodeURI(`https://api.twitch.tv/helix/users/follows?` + `from_id=${UID}&to_id=${chanUID}`))
            if (data.data[0] === undefined) {
                return { 'say': `ForsenLookingAtYou This person is not following this channel` }
            }
            channame = data.data[0].from_name
            const elapsed = await utils.time(data.data[0].followed_at)
            return { 'say': `${sender}, ${channame} has been following ${chan} for ${elapsed}` }
        } else {
            let [UID, UID2] = await Promise.all([utils.getUID(message[1].toLowerCase()), utils.getUID(message[2].toLowerCase())])
            if (UID === undefined) { return { 'say': `ForsenLookingAtYou That isn't a real user` } }
            if (UID2 === undefined) { return { 'say': `ForsenLookingAtYou That isn't a real user` } }
            const data = await getFollowers(encodeURI(`https://api.twitch.tv/helix/users/follows?` + `from_id=${UID}&to_id=${UID2}`))
            if (data.data[0] === undefined) {
                return { 'say': `ForsenLookingAtYou This person is not following that channel` }
            }
            channame = data.data[0].from_name
            namechan = data.data[0].to_name
            const elapsed = await utils.time(data.data[0].followed_at)
            return { 'say': `${sender}, ${channame} has been following ${namechan} for ${elapsed}` }
        }
    },
    userCooldown: 10000,
    chanCooldown: 0,
    description: `Returns someones followage to a channel. Usage: *fa [user1] [user2], Examples, *fa - followage of sender to current channel, *fa doodole_ - followage of user 1 to current channel, *fa doodole_ forsen - followage of user 1 to user 2`,
    permissions: `global`
}