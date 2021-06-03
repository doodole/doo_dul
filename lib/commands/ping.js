const utils = require('../utils')
const fetch = require('node-fetch')

const con = utils.con

let start_date = Date.now()

module.exports = {
    name: 'ping',
    alias: [],
    code: async (chan, chanUID, sender, senderUID, message) => {
        const elapsed = await utils.time(start_date)
        const [apiCheck] = await con.promise().query(`SELECT * FROM channels WHERE UID = ${chanUID}`)
        if (apiCheck[0].banphraseAPI === null || apiCheck[0].banphraseAPI === '') {
            return { 'say': `${sender}, yo. uptime: ${elapsed}. Not connected to a banphrase api` }
        }
        let apiType;
        const t0 = Date.now()
        if (apiCheck[0].apiType === 'pajbot') {
            apiType = 'pajbot'
            const options = {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "message": 'xD'
                })
            }
            await fetch(encodeURI(apiCheck[0].banphraseAPI), options)
        }
        const t1 = Date.now()
        return { 'say': `${sender}, yo. uptime: ${elapsed}. Using ${apiType} banphrase API (${t1 - t0} ms)` }
    },
    userCooldown: 10000,
    chanCooldown: 5000,
    description: `Pings the bot. Also shows some information about the bot`,
    permissions: `global`
}