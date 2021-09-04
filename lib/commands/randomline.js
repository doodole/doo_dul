const utils = require(`../utils.js`)
var mysql = require(`mysql2`);

const con = utils.con

module.exports = {
    name: 'randomline',
    alias: ['rl', 'randomquote', 'rq'],
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
        if (['rl', 'randomline'].includes(message[0])) {
            if (message[1] === undefined) {
                const sql = `SELECT date, sender, message FROM logs WHERE chanUID = ${mysql.escape(chanUID)} ORDER BY RAND() LIMIT 1`
                const [results] = await con.promise().query(sql)
                if (results.length === 0) {
                    return { 'say': `This channel has no logs!` }
                }
                return determineTimeElapsed(results[0].date, results[0].sender, results[0].message)
            } else {
                const sql = `SELECT date, sender, message FROM logs WHERE chanUID = ${mysql.escape(chanUID)} AND sender = ${mysql.escape(message[1])}`
                const [results] = await con.promise().query(sql)
                if (!results.length) {
                    return { 'say': `${sender}, ${message[1]} has no logs in this channel!` }
                }
                const randomRow = results[Math.floor(Math.random() * results.length)]
                return determineTimeElapsed(randomRow.date, randomRow.sender, randomRow.message)
            }
        } if (['rq', 'randomquote'].includes(message[0])) {
            if (message[1] === undefined) {
                const sql = `SELECT date, sender, message FROM logs WHERE chanUID = ${mysql.escape(chanUID)} AND senderUID = ${mysql.escape(senderUID)}`
                const [results] = await con.promise().query(sql)
                if (results.length === 0) {
                    return { 'say': `${sender}, You have no logs in this channel FeelsDankMan` }
                }
                const randomRow = results[Math.floor(Math.random() * results.length)]
                return determineTimeElapsed(randomRow.date, randomRow.sender, randomRow.message)
            } else {
                const sql = `SELECT date, sender, message FROM logs WHERE chanUID = ${mysql.escape(chanUID)} AND sender = ${mysql.escape(message[1])}`
                const [results] = await con.promise().query(sql)
                if (!results.length) {
                    return { 'say': `${sender}, ${message[1]} has no logs in this channel!` }
                }
                const randomRow = results[Math.floor(Math.random() * results.length)]
                return determineTimeElapsed(randomRow.date, randomRow.sender, randomRow.message)
            }
        }
    },
    userCooldown: 10000,
    chanCooldown: 0,
    description: `Gets a random chat message from the current channel`,
    permissions: `global`
}