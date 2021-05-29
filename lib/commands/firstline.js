const utils = require(`../utils.js`)
var mysql = require(`mysql`);

const con = utils.con

module.exports = {
    name: 'firstline',
    alias: ['fl'],
    code: async (chan, chanUID, sender, senderUID, message) => {
        if(chan === 'katelynerika') {return}
        const timeElapsed = async (time, sender, message) => {
            const date = new Date - time
            const years = Math.floor(date/3.154e+10)
            const days = Math.floor((date - years*3.154e+10)/86400000)
            const hours = Math.floor((date - years*3.154e+10 - days*86400000)/3600000)
            const mins = Math.floor((date - years*3.154e+10 - days*86400000 - hours*3600000)/60000)
            const seconds = Math.floor((date - years*3.154e+10 - days*86400000 - hours*3600000 - mins*60000)/1000)
            if (years != 0) {
                return {'say': `(${years}y, ${days}d ago) ${sender}: ${message}`}
            } else if (days != 0) {
                return {'say': `(${days}d, ${hours}h ago) ${sender}: ${message}`}
            } else if (hours != 0) {
                return {'say': `(${hours}h, ${mins}m ago) ${sender}: ${message}`}
            } else if (mins !=0) {
                return {'say': `(${mins}m, ${seconds}s ago) ${sender}: ${message}`}
            } else if (seconds != 0) {
                return {'say': `(${seconds}s ago) ${sender}: ${message}`}
            }
        }
        if (message[1] === undefined) {
            const sql = `SELECT * FROM logs WHERE chanUID = ${mysql.escape(chanUID)} AND senderUID = ${mysql.escape(senderUID)}`
            const results = await utils.query(sql)
            if (results.length === 0) {
                return {'say': `${sender}, You have no logs in this channel!`}
            }
            const randomRow = results[0]
            return timeElapsed(randomRow.date, randomRow.sender, randomRow.message)
        }
        else {
            console.log(message[1])
            const sql = `SELECT * FROM logs WHERE chanUID = ${mysql.escape(chanUID)} AND sender = ${mysql.escape(message[1])}`
            const results = await utils.query(sql)
            if (!results.length) {
                return {'say': `${sender}, ${message[1]} has no logs in this channel!`}
            }
            const randomRow = results[0]
            return timeElapsed(randomRow.date, randomRow.sender, randomRow.message)
        }
    },
    userCooldown : 10000,
    chanCooldown : 0,
    description : `Gets the first recorded line a user has typed in the current channel. Defaults to your first line. If one user is passed, finds the first line said by that user`,
    permissions: `global`
}