const utils = require(`../utils.js`)
const mysql = require('mysql2')

const con = utils.con

module.exports = {
    name: 'removeme',
    alias: [],
    code: async (chan, chanUID, sender, senderUID, message) => {
        if (message[1] === 'live') {
            const [channels] = await con.promise().query(`SELECT * FROM live WHERE channel = ${mysql.escape(chan)}`)
            if (channels.length === 0 || channels[0].notifications === 'no') {
                return {'say': `This channel is not taking live notifications`};
            }
            else if (!channels[0].peopleLive.includes(sender)) {
                return {'say': `You aren't taking live notifications. To enable it, say *notifyme live`}
            }
            con.query(`UPDATE live SET peopleLive = REPLACE(peopleLive, ${mysql.escape(sender)}, '') WHERE channelUID = ${mysql.escape(chanUID)}`)
            const [res] = await con.promise().query(`SELECT peopleLive FROM live WHERE channelUID = ${mysql.escape(chanUID)}`)
            const cleantext = res[0].peopleLive.replace(/\s+/g, " ").trim()
            con.query(`UPDATE live SET peopleLive = ${mysql.escape(cleantext)} WHERE channelUID = ${mysql.escape(chanUID)}`)
            return {'say': `You won't be notified anymore when the streamer goes live`}
        }
        if (message[1] === 'offline') {
            const [channels] = await con.promise().query(`SELECT * FROM live WHERE channel = ${mysql.escape(chan)}`)
            if (channels.length === 0 || channels[0].notifications === 'no') {
                return {'say': `This channel is not taking offline notifications`};
            }
            else if (!channels[0].peopleOffline.includes(sender)) {
                return {'say': `You aren't taking offline notifications. To enable it, say *notifyme offline`}
            }
            con.query(`UPDATE live SET peopleOffline = REPLACE(peopleOffline, ${mysql.escape(sender)}, '') WHERE channelUID = ${mysql.escape(chanUID)}`)
            const [res] = await con.promise().query(`SELECT peopleOffline FROM live WHERE channelUID = ${mysql.escape(chanUID)}`)
            const cleantext = res[0].peopleOffline.replace(/\s+/g, " ").trim()
            con.query(`UPDATE live SET peopleOffline = ${mysql.escape(cleantext)} WHERE channelUID = ${mysql.escape(chanUID)}`)
            return {'say': `You won't be notified anymore when the streamer goes offline`}
        }
    },
    userCooldown : 10000,
    chanCooldown : 0,
    description : `Stop being notified of certain things on a channel. Available events: live. Example usage *removeme live`,
    permissions: `global`
}