const fetch = require('node-fetch')
const { getToken, time, getUID , refreshToken, getBestAvailableEmote } = require(`../utils`)

module.exports = {
    name: 'followage',
    alias: ['fa'],
    code: async (chan, chanUID, sender, senderUID, message) => {
        const getFollowers = async (url) => {
            const options = {
                method: 'GET',
                headers: {
                    'Client-ID': process.env.CLIENTID,
                    'Authorization': 'Bearer ' + getToken()
                },
            }

            const res = await fetch(encodeURI(url), options)
            const status = await res.status;

            if (status === "401") {
                refreshToken()
                return getFollowers(url)
            }
            return res.json()
        }

        const emote = getBestAvailableEmote(["ForsenLookingAtYou", "Stare"], ":Z", chanUID)

        if (message[1] === undefined) {
            const data = await getFollowers(encodeURI(`https://api.twitch.tv/helix/users/follows?` + `from_id=${senderUID}&to_id=${chanUID}`))
            if (data.data[0] === undefined) {
                return { 'say': `${sender}, You aren't following this channel ${emote}` }
            }

            const elapsed = await time(data.data[0].followed_at)
            return { 'say': `${sender}, You have been following ${chan} for ${elapsed}` };
        } if (message[2] === undefined) {
            const UID = await getUID(message[1].toLowerCase())
            if (UID === undefined) { 
                return { 'say': `${sender}, ${emote} ${message[1]} isn't a real user` } 
            }

            const data = await getFollowers(encodeURI(`https://api.twitch.tv/helix/users/follows?` + `from_id=${UID}&to_id=${chanUID}`))
            if (data.data[0] === undefined) {
                return { 'say': `${sender}, ${emote} ${message[1]} is not following this channel` }
            }

            channame = data.data[0].from_name
            const elapsed = await time(data.data[0].followed_at)
            return { 'say': `${sender}, ${channame} has been following ${chan} for ${elapsed}` }
        } else {
            let [UID, UID2] = await Promise.all([getUID(message[1].toLowerCase()), getUID(message[2].toLowerCase())])
            if (UID === undefined) { 
                return { 'say': `${sender}, ${emote} ${message[1]} isn't a real user` }
            }
            if (UID2 === undefined) { 
                return { 'say': `${sender}, ${emote} ${message[2]} isn't a real user` }
            }

            const data = await getFollowers(encodeURI(`https://api.twitch.tv/helix/users/follows?` + `from_id=${UID}&to_id=${UID2}`))
            if (data.data[0] === undefined) {
                return { 'say': `${sender}, ForsenLookingAtYou ${message[1]} is not following ${message[2]}` }
            }

            channame = data.data[0].from_name
            namechan = data.data[0].to_name
            const elapsed = await time(data.data[0].followed_at)
            return { 'say': `${sender}, ${channame} has been following ${namechan} for ${elapsed}` }
        }
    },
    userCooldown: 10000,
    chanCooldown: 0,
    description: `Returns someones followage to a channel. Usage: *fa [user1] [user2], Examples, *fa - followage of sender to current channel, *fa doodole_ - followage of user 1 to current channel, *fa doodole_ forsen - followage of user 1 to user 2`,
    permissions: `global`
}