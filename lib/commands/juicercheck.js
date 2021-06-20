const fetch = require('node-fetch')
const utils = require('../utils')

module.exports = {
    name: 'juicercheck',
    alias: ['jc'],
    code: async (chan, chanUID, sender, senderUID, message) => {
        const options = {
            method: 'GET',
        }
        const res = await fetch(`https://api.ivr.fi/twitch/subage/${sender}/xqcow`, options)
        const data = await res.json()
        const { subscribed, meta, cumulative, streak } = data
        if (data.status === 500) {
            return { 'say': `${sender}, Something went wrong getting this information!` }
        } if (subscribed === false && cumulative.months === 0) {
            return { 'say': `${sender}, FeelsOkayMan You're safe` }
        } if (subscribed === false) {
            return { 'say': `${sender}, Hmm You aren't a juicer now, but you have previously been subbed ${cumulative.months} months` }
        } if (meta.type === 'gift') {
            return { 'say': `${sender}, You are subbed to the juicer with a gifted sub. Kinda sus :tf: cvHazmat` }
        } 
        return { 'say': `${sender}, MODS Juicer detected` }
    },
    userCooldown: 10000,
    chanCooldown: 5000,
    description: `Checks to see if the user is subbed to xqc. Usage: *juicercheck`,
    permissions: `global`

}