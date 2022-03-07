const utils = require(`../utils.js`)

const con = utils.con

module.exports = {
    name: 'notifyme',
    alias: [],
    code: async (chan, chanUID, sender, senderUID, message) => {
        if (message[1] === 'live') {
            const [channels] = await con.promise().query(
                `SELECT * FROM live 
                WHERE channel = ?`, [chan]
            )
            if (channels[0].notifications === 'no') {
                return { 'say': `This channel is not taking live notifications` };
            } else if (channels[0].peopleLive.includes(sender)) {
                return { 'say': `You are already taking live notifications. To disable it, say *removeme live` }
            }
            con.query(
                `UPDATE live 
                SET peopleLive = CONCAT(peopleLive, ?) 
                WHERE channelUID = ?`, [sender + ' ', chanUID]
            )
            return { 'say': 'You will now be notified when the streamer goes live!' }
        }
        if (message[1] === 'offline') {
            const [channels] = await con.promise().query(
                `SELECT * 
                FROM live 
                WHERE channelUID = ?`, [chanUID]
            )
            if (channels[0].notifications === 'no') {
                return { 'say': `This channel is not taking offline notifications` };
            } else if (channels[0].peopleOffline.includes(sender)) {
                return { 'say': `You are already taking offline notifications. To disable it, say *removeme offline` }
            }
            con.query(
                `UPDATE live 
                SET peopleOffline = CONCAT(peopleOffline, ?) 
                WHERE channelUID = ?`, [sender + ' ', chanUID]
            )
            return { 'say': 'You will now be notified when the streamer goes offline!' }
        }
    },
    userCooldown: 5000,
    chanCooldown: 0,
    description: `Be notified of certain things on a channel. Available events: live, offline. Example usage: *notifyme live`,
    permissions: `global`
}