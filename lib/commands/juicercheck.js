const fetch = require('node-fetch')
const { getBestAvailableEmote } = require('../utils')

module.exports = {
    name: 'juicercheck',
    alias: ['jc'],
    code: async (chan, chanUID, sender, senderUID, message) => {
        const options = {
            method: 'GET',
        }
        if (message[1] === undefined) {
            const res = await fetch(`https://api.ivr.fi/twitch/subage/${sender}/xqcow`, options)
            const data = await res.json()
            if (data.status === 500) {
                return { 'say': `${sender}, Something went wrong getting this information!` }
            }
            const { hidden, subscribed, meta, cumulative, streak } = data
            if (hidden) {
                return { 'say': `${sender}, ${getBestAvailableEmote(['ForsenLookingAtYou', 'Stare'], ':Z')} Your sub info is hidden` }
            } if (subscribed === false && cumulative.months === 0) {
                return { 'say': `${sender}, ${getBestAvailableEmote(['FeelsOkayMan'], ':)')} You're safe` }
            } if (subscribed === false) {
                return { 'say': `${sender}, ${getBestAvailableEmote(['Hmm'], '🤔')} You aren't a juicer now, but you have previously been subbed ${cumulative.months} months` }
            } if (meta.type === 'gift') {
                return { 'say': `${sender}, You are subbed to the juicer with a gifted sub. Kinda sus ${getBestAvailableEmote(['amongE', 'amongNus', 'SUSSY'], '🤨')}` }
            }
            return { 'say': `${sender}, ${getBestAvailableEmote(['MODS'], 'DansGame')} 👉 ${sender} Juicer detected` }
        }
        const res = await fetch(`https://api.ivr.fi/twitch/subage/${message[1]}/xqcow`, options)
        const data = await res.json()
        if (data.status === 500) {
            return { 'say': `${sender}, Something went wrong getting this information!` }
        }
        const { username, hidden, subscribed, meta, cumulative, streak } = data
        if (hidden) {
            return { 'say': `${sender}, ${username} has their sub info hidden DansGame` }
        } if (subscribed === false && cumulative.months === 0) {
            return { 'say': `${sender}, ${getBestAvailableEmote(['FeelsOkayMan'], ':)')} ${username} is safe` }
        } if (subscribed === false) {
            return { 'say': `${sender}, ${getBestAvailableEmote(['Hmm'], '🤔')} ${username} isn't a juicer now, but has previously been subbed ${cumulative.months} months` }
        } if (meta.type === 'gift') {
            return { 'say': `${sender}, ${username} is subbed to the juicer with a gifted sub. Kinda sus ${getBestAvailableEmote(['amongE', 'amongNus', 'SUSSY'], '🤨')}` }
        }
        return { 'say': `${sender}, ${getBestAvailableEmote(['MODS'], 'DansGame')} 👉 ${username} Juicer detected` }
    },
    userCooldown: 10000,
    chanCooldown: 0,
    description: `Checks to see if the user is subbed to xqc. Usage: *juicercheck`,
    permissions: `global`

}