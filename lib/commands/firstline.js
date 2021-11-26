const utils = require(`../utils.js`)
var mysql = require(`mysql2`);

const con = utils.con

module.exports = {
    name: 'firstline',
    alias: ['fl'],
    code: async (chan, chanUID, sender, senderUID, message) => {
        if (chan === 'katelynerika') { return }
        if (chan === 'minusinsanity') {
            const [result] = await con.promise().query(
                `SELECT isLive FROM live
                WHERE channelUID = '17497365'`
            )
            if (result[0].isLive === 'true') { return }
        }
        const determineTimeElapsed = async (time, sender, message) => {
            const date = new Date() - time
            const years = Math.floor(date / 3.154e+10)
            const days = Math.floor((date - years * 3.154e+10) / 86400000)
            const hours = Math.floor((date - years * 3.154e+10 - days * 86400000) / 3600000)
            const mins = Math.floor((date - years * 3.154e+10 - days * 86400000 - hours * 3600000) / 60000)
            const seconds = Math.floor((date - years * 3.154e+10 - days * 86400000 - hours * 3600000 - mins * 60000) / 1000)
            if (years != 0) {
                return { 'say': `(${years}y, ${days}d ago) ${sender}: ${message}` }
            } else if (days != 0) {
                return { 'say': `(${days}d, ${hours}h ago) ${sender}: ${message}` }
            } else if (hours != 0) {
                return { 'say': `(${hours}h, ${mins}m ago) ${sender}: ${message}` }
            } else if (mins != 0) {
                return { 'say': `(${mins}m, ${seconds}s ago) ${sender}: ${message}` }
            } else if (seconds != 0) {
                return { 'say': `(${seconds}s ago) ${sender}: ${message}` }
            }
        }
        const channelLogs = 'logs_' + chanUID
        if (message[1] === undefined) {
            const [firstMessage] = await con.promise().query(
                `SELECT date, sender, message 
                FROM ?? 
                WHERE senderUID = ? LIMIT 1`, 
                [channelLogs, senderUID]
            )
            if (firstMessage.length === 0) {
                return { 'say': `${sender}, You have no logs in this channel!` }
            }
            return determineTimeElapsed(firstMessage[0].date, firstMessage[0].sender, firstMessage[0].message)
        }
        else {
            const [firstMessage] = await con.promise().query(
                `SELECT date, sender, message 
                FROM ?? 
                WHERE sender = ? LIMIT 1`, 
                [channelLogs, message[1]]
            )
            if (!firstMessage.length) {
                return { 'say': `${sender}, ${message[1]} has no logs in this channel!` }
            }
            return determineTimeElapsed(firstMessage[0].date, firstMessage[0].sender, firstMessage[0].message)
        }
    },
    userCooldown: 10000,
    chanCooldown: 0,
    description: `Gets the first recorded line a user has typed in the current channel. Defaults to your first line. If one user is passed, finds the first line said by that user`,
    permissions: `global`
}