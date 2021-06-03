const utils = require(`../utils.js`)
var mysql = require(`mysql2`);

const con = utils.con

module.exports = {
    name: 'addban',
    alias: ['addbanphrase', 'banphrase'],
    code: async (chan, chanUID, sender, senderUID, message) => {
        const ban = message.slice(1, -1).join(' ')
        const time = message[message.length - 1]
        if (time.match(/^[0-9]+$/) === null && ![`ban`, `perma`, `permaban`].includes(time)) {
            return { 'say': `${sender}, Timeout must be specified at the end with only numbers (in seconds) or "perma" for a permaban` };
        } if (time > 1209600) {
            return { 'say': `${sender}, Timeout must be less than 1209600 (in seconds) or "perma" for a permaban` };
        } else {
            const [channelBans] = await con.promise().query(`SELECT * FROM banphrases WHERE channelUID = ${mysql.escape(chanUID)}`)
            for (const i in channelBans) {
                if (channelBans[i].banphrase.toLowerCase() === ban.toLowerCase() && channelBans[i].timeout.toLowerCase() === time) {
                    return { 'say': `${sender}, This banphrase already exists!` }
                } if (channelBans[i].banphrase.toLowerCase() === ban) {
                    con.query(`UPDATE banphrases SET timeout = ${mysql.escape(time)} WHERE channelUID = ${mysql.escape(chanUID)} AND banphrase = ${mysql.escape(ban)}`)
                    return { 'say': `${sender}, Banphrase updated!` }
                }
            }
            con.query(`INSERT INTO banphrases VALUES (${mysql.escape(chanUID)}, ${mysql.escape(chan)}, ${mysql.escape(ban)}, ${mysql.escape(time)})`)
            return { 'say': `${sender}, Banphrase added!` }
        }
    },
    userCooldown: 0,
    chanCooldown: 0,
    description: `Add a banned phrase to a channel`,
    permissions: `mods`
}