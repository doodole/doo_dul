const utils = require(`../utils.js`)
var mysql = require(`mysql2`);
const fetch = require('node-fetch')

const con = utils.con

module.exports = {
    name: 'notify',
    alias: [],
    code: async (chan, chanUID, sender, senderUID, message) => {
        if (message[1] === 'follow') {
            const [channels] = await con.promise().query(
                `SELECT channel FROM follownotifications 
                WHERE channel = ${mysql.escape(chan)}`
            )
            if (channels.length !== 0) {
                return { 'say': `${utils.getBestAvailableEmote(['ForsenLookingAtYou', 'Stare'], ':Z')} You are already taking follow notifications` };
            }
            const options = {
                method: 'POST',
                headers: {
                    'Client-ID': process.env.CLIENTID,
                    'Authorization': 'Bearer ' + utils.getToken(),
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "type": "channel.follow",
                    "version": "1",
                    "condition": {
                        "broadcaster_user_id": chanUID
                    },
                    "transport": {
                        "method": "webhook",
                        "callback": process.env.FOLLOW_CALLBACK,
                        "secret": process.env.WEBHOOKSECRET
                    }
                })
            }
            const res = await fetch(`https://api.twitch.tv/helix/eventsub/subscriptions`, options)
            const data = await res.json()
            con.query(
                `INSERT INTO follownotifications (channel, channelUID, message, id) 
                VALUES (?, ?, '$follower has followed PogChamp', ?)`, [chan, chanUID, data.data[0].id]
            )
            return { 'say': 'You will now be notified when a user follows you!' }
        } else if (message[1] === 'live') {
            const [channels] = await con.promise().query(
                `SELECT notifications 
                FROM live 
                WHERE channelUID = ?`, [chanUID]
            )
            console.log(channels[0].notifications)
            if (channels[0].notifications === 'no') {
                con.query(
                    `UPDATE live 
                    SET notifications = 'yes' 
                    WHERE channelUID = ?`, [chanUID]
                )
                return { 'say': `Live notifications have been enabled!` }
            }
            return { 'say': `${utils.getBestAvailableEmote(['ForsenLookingAtYou', 'Stare'], ':Z')} You are already taking live notifications` }
        }
    },
    userCooldown: 0,
    chanCooldown: 0,
    description: `Once enabled, chat messages will be posted when an event happens. Availiable events: live, follow. Example usage: *notify live`,
    permissions: `broadcaster`
}