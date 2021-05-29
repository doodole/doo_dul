const utils = require(`../utils.js`)
var mysql = require(`mysql`);
const fetch = require('node-fetch')

const con = utils.con

module.exports = {
    name: 'notify',
    alias: [],
    code: async (chan, chanUID, sender, senderUID, message) => {
        if (message[1] === 'follow') {
            const channels = await utils.query(`SELECT channel FROM follownotifications WHERE channel = ${mysql.escape(chan)}`)
            if (channels.length !== 0) {
                return {'say': `ForsenLookingAtYou You are already taking follow notifications`};
            } if (channels[0].notifications === 'no') {
                con.query(`UPDATE live SET notifications = 'yes' WHERE channelUID = ${mysql.escape(chanUID)}`)
                return {'say': `Live notifications have been enabled!`}
            }
            const options = {
                method: 'POST',
                headers: {
                  'Client-ID': process.env.CLIENTID,
                  'Authorization': 'Bearer ' + utils.AT,
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
            con.query(`INSERT INTO follownotifications (channel, channelUID, message, id) VALUES (${mysql.escape(chan)}, ${mysql.escape(chanUID)}, 'has followed PogChamp', ${mysql.escape(data.data[0].id)})`)
            return {'say': 'You will now be notified when a user follows you!'}
        } else if (message[1] === 'live') {
            const channels = await utils.query(`SELECT channel FROM live WHERE channel = ${mysql.escape(chan)}`)
            if (channels.length !== 0) {
                return {'say': `ForsenLookingAtYou You are already taking live notifications`};
            }
            const liveoptions = {
                method: 'POST',
                headers: {
                  'Client-ID': process.env.CLIENTID,
                  'Authorization': 'Bearer ' + utils.AT,
                  'Accept': 'application/json', 
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "type": "stream.online",
                    "version": "1",
                    "condition": {
                        "broadcaster_user_id": chanUID
                    },
                    "transport": {
                        "method": "webhook",
                        "callback": process.env.LIVE_CALLBACK,
                        "secret": process.env.WEBHOOKSECRET
                    }
                })
            }
            const offlineoptions = {
                method: 'POST',
                headers: {
                  'Client-ID': process.env.CLIENTID,
                  'Authorization': 'Bearer ' + utils.AT,
                  'Accept': 'application/json', 
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "type": "stream.offline",
                    "version": "1",
                    "condition": {
                        "broadcaster_user_id": chanUID
                    },
                    "transport": {
                        "method": "webhook",
                        "callback": process.env.LIVE_CALLBACK,
                        "secret": process.env.WEBHOOKSECRET
                    }
                })
            }
            const postEventSub = async (option) => {
                const res = await fetch(`https://api.twitch.tv/helix/eventsub/subscriptions`, option)
                return await res.json()
            }
            const [onlinedata, offlinedata] = await Promise.all([postEventSub(liveoptions), postEventSub(offlineoptions)])
            con.query(`INSERT INTO live (channel, channelUID, isLive, messageLive, messageOffline, LiveID, OfflineID, notifications) VALUES (${mysql.escape(chan)}, ${mysql.escape(chanUID)}, 'false', ${mysql.escape(chan + ' has gone live PogChamp')}, ${mysql.escape(chan + ' has gone offline FeelsBadMan')}, ${mysql.escape(onlinedata.data[0].id)}, ${mysql.escape(offlinedata.data[0].id)}, 'yes')`)
            return {'say': 'Live and offline notifications are now enabled!'}
        }
    },
    userCooldown : 0,
    chanCooldown : 0,
    description : `Once enabled, chat messages will be posted when an event happens. Availiable events: live, follow. Example usage: *notify live`,
    permissions: `broadcaster`
}