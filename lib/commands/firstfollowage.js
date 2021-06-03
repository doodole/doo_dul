const fetch = require('node-fetch')
const utils = require(`../utils`)

module.exports = {
    name: 'firstfollowage',
    alias: ['ffa'],
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
            if (status === 401) {
                utils.AT = await utils.getToken()
            }
            return res.json()
        }
        const followTable = []
        if (message[1] === undefined) {
            let data = await getFollowers(`https://api.twitch.tv/helix/users/follows?` + `first=100&from_id=` + senderUID)
            for (i in data.data) {
                followTable.push(data.data[i])
            }
            while (Object.keys(data.pagination).length) {
                data = await getFollowers(`https://api.twitch.tv/helix/users/follows?` + `after=${data.pagination.cursor}&first=100&from_id=` + senderUID)
                for (i in data.data) {
                    followTable.push(data.data[i])
                }
            }
            const firstfollow = followTable[followTable.length - 1]
            const firstfollowname = firstfollow.to_name
            const elapsed = await utils.time(firstfollow.followed_at)
            return { 'say': `${sender}, You have been following ${firstfollowname} for ${elapsed}` }
        } else {
            const UID = await utils.getUID(message[1].toLowerCase())
            if (UID === undefined) { return { 'say': `ForsenLookingAtYou That isn't a real user` } }
            let data = await getFollowers(`https://api.twitch.tv/helix/users/follows?` + `first=100&from_id=` + UID)
            for (i in data.data) {
                followTable.push(data.data[i])
            }
            while (Object.keys(data.pagination).length) {
                data = await getFollowers(`https://api.twitch.tv/helix/users/follows?` + `after=${data.pagination.cursor}&first=100&from_id=` + UID)
                for (i in data.data) {
                    followTable.push(data.data[i])
                }
            }
            const firstfollow = followTable[followTable.length - 1]
            if (firstfollow === undefined) { return { 'say': `${sender}, ${message[1]} is not following anyone B)` } }
            const firstfollowname = firstfollow.to_name
            const namefirstfollow = firstfollow.from_name
            const elapsed = await utils.time(firstfollow.followed_at)
            return { 'say': `${sender}, ${namefirstfollow} has been following ${firstfollowname} for ${elapsed}` }
        }
    },
    userCooldown: 10000,
    chanCooldown: 0,
    description: `Returns the first channel someone has followed. Usage: *ffa [user], Examples, *ffa - first followed channel of the sender, *ffa doodole_ - first followed channel of doodole_`,
    permissions: `global`
}