const { con, getBestAvailableEmote } = require(`../utils.js`)
var mysql = require(`mysql2`);

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
        const channelLogs = 'logs_' + chanUID
        if (['rl', 'randomline'].includes(message[0])) {
            if (message[1] === undefined) {
                const [data] = await con.promise().query(
                    `SELECT MAX(messageID) AS lineCount
                    FROM ??`, 
                    [channelLogs]
                )
                if (data[0].lineCount === null) {
                    return {'say': `This channel has no logs!`}
                }
                const randomMessageID = Math.floor(Math.random() * (data[0].lineCount - 1)) + 1

                const [randomMessage] = await con.promise().query(
                    `SELECT date, sender, message 
                    FROM ??
                    WHERE messageID = ?`, 
                    [channelLogs, randomMessageID]
                )

                return determineTimeElapsed(randomMessage[0].date, randomMessage[0].sender, randomMessage[0].message)
            } else {
                if (message[1].toLowerCase() == "titlechange_bot") { 
                    return {'say': `${sender}, ${getBestAvailableEmote(['ForsenLookingAtYou', 'FeelsWeirdMan'], ':-/ ', chanUID)} Trying to rl mass ping bot`}
                }

                const [data] = await con.promise().query(
                    `SELECT ROUND(
                        RAND() * (SELECT MAX(messageID) FROM ?? WHERE sender = ?)
                    ) AS randomMessageID`,
                    [channelLogs, message[1]]
                )
                if (data[0].randomMessageID === null) {
                    return {'say': `No logs were fetched for this user in this channel.`}
                }
                const randomMessageID = data[0].randomMessageID

                const [randomIDs] = await con.promise().query(
                    `SELECT messageID 
                    FROM ??
                    WHERE messageID >= ? AND sender = ?
                    LIMIT 50`, 
                    [channelLogs, randomMessageID, message[1]]
                )
                if (!randomIDs.length) {
                    return {'say': `No logs were fetched for this user in this channel.`}
                }
                const randomID = randomIDs[Math.floor(Math.random() * randomIDs.length)].messageID
                
                const [randomMessage] = await con.promise().query(
                    `SELECT date, sender, message  
                    FROM ??
                    WHERE messageID = ? AND sender = ?`, 
                    [channelLogs, randomID, message[1]]
                )

                return determineTimeElapsed(randomMessage[0].date, randomMessage[0].sender, randomMessage[0].message)
            }
        } if (['rq', 'randomquote'].includes(message[0])) {
            if (message[1] === undefined) {
                const [data] = await con.promise().query(
                    `SELECT ROUND(
                        RAND() * (SELECT MAX(messageID) FROM ?? WHERE senderUID = ?)
                    ) AS randomMessageID`,
                    [channelLogs, senderUID]
                )
                if (data[0].randomMessageID === null) {
                    return {'say': `No logs were fetched for this user in this channel.`}
                }
                const randomMessageID = data[0].randomMessageID

                const [randomIDs] = await con.promise().query(
                    `SELECT messageID 
                    FROM ??
                    WHERE messageID >= ? AND senderUID = ?
                    LIMIT 50`, 
                    [channelLogs, randomMessageID, senderUID]
                )
                if (!randomIDs.length) {
                    return {'say': `No logs were fetched for this user in this channel.`}
                }
                const randomID = randomIDs[Math.floor(Math.random() * randomIDs.length)].messageID
                
                const [randomMessage] = await con.promise().query(
                    `SELECT date, sender, message  
                    FROM ??
                    WHERE messageID = ? AND senderUID = ?`, 
                    [channelLogs, randomID, senderUID]
                )

                return determineTimeElapsed(randomMessage[0].date, randomMessage[0].sender, randomMessage[0].message)
            } else {
                if (message[1].toLowerCase() == "titlechange_bot") { 
                    return {'say': `${sender}, ${getBestAvailableEmote(['ForsenLookingAtYou', 'FeelsWeirdMan'], ':-/ ', chanUID)} Trying to rl mass ping bot`}
                }

                const [data] = await con.promise().query(
                    `SELECT ROUND(
                        RAND() * (SELECT MAX(messageID) FROM ?? WHERE sender = ?)
                    ) AS randomMessageID`,
                    [channelLogs, message[1]]
                )
                if (data[0].randomMessageID === null) {
                    return {'say': `No logs were fetched for this user in this channel.`}
                }
                const randomMessageID = data[0].randomMessageID

                const [randomIDs] = await con.promise().query(
                    `SELECT messageID 
                    FROM ??
                    WHERE messageID >= ? AND sender = ?
                    LIMIT 50`, 
                    [channelLogs, randomMessageID, message[1]]
                )
                if (!randomIDs.length) {
                    return {'say': `No logs were fetched for this user in this channel.`}
                }
                const randomID = randomIDs[Math.floor(Math.random() * randomIDs.length)].messageID
                
                const [randomMessage] = await con.promise().query(
                    `SELECT date, sender, message  
                    FROM ??
                    WHERE messageID = ? AND sender = ?`, 
                    [channelLogs, randomID, message[1]]
                )

                return determineTimeElapsed(randomMessage[0].date, randomMessage[0].sender, randomMessage[0].message)
            }
        }
    },
    userCooldown: 10000,
    chanCooldown: 0,
    description: `Gets a random chat message from the current channel`,
    permissions: `global`
}