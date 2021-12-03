const fetch = require('node-fetch')
const utils = require('../utils')

module.exports = {
    name: 'subage',
    alias: ['sa'],
    code: async (chan, chanUID, sender, senderUID, message) => {
        const options = {
            method: 'GET',
        }
        if (message[1] === undefined) {
            const res = await fetch(`https://api.ivr.fi/twitch/subage/${sender}/${chan}`, options)
            const data = await res.json()
            if (data.status === 500) {
                return { 'say': `${sender}, Something went wrong getting this information!` }
            } 
            const { hidden, subscribed, meta, cumulative, streak } = data
            if (hidden) {
                return { 'say': `${sender}, ForsenLookingAtYou Your sub info is hidden` }
            } if (subscribed === false && cumulative.months === 0) {
                return { 'say': `${sender}, You haven't subscribed to this channel ForsenLookingAtYou` }
            } if (subscribed === false) {
                let endsAt = await utils.time(cumulative.end)
                return { 'say': `${sender}, You are not currently subbed to this channel, but have previously subbed ${cumulative.months} months. This sub ended ${endsAt} ago` }
            }
            let endsAt = await utils.time(meta.endsAt)
            if (meta.type === 'gift') {
                return { 'say': `${sender}, You are currently subbed to this channel with a gifted tier ${meta.tier} sub from ${meta.gift.name}, for a total of ${cumulative.months} months and a streak of ${streak.months} months. ${meta.endsAt ? `This sub ends in ${endsAt}` : `This sub is permanent`}.` }
            } if (meta.type === 'prime') {
                return { 'say': `${sender}, You are currently subbed to this channel with a prime sub, for a total of ${cumulative.months} months and a streak of ${streak.months} months. ${meta.endsAt ? `This sub ends in ${endsAt}` : `This sub is permanent`}.` }
            }
            return { 'say': `${sender}, You are currently subbed to this channel with a tier ${meta.tier} sub, for a total of ${cumulative.months} months and a streak of ${streak.months} months. ${meta.endsAt ? `This sub ends in ${endsAt}` : `This sub is permanent`}.` }
        } if (message[2] === undefined) {
            const res = await fetch(`https://api.ivr.fi/twitch/subage/${message[1]}/${chan}`, options)
            const data = await res.json()
            if (data.error === 'No data found. User is probably banned.') {
                return { 'say': `${sender}, ${message[1]}'s data couldn't be found. They are probably banned` }
            } if (data.status === 500) {
                return { 'say': `${sender}, Something went wrong getting this information!` }
            }
            const { username, hidden, subscribed, meta, cumulative, streak } = data
            if (hidden) {
                return { 'say': `${sender}, ${username} has their sub info hidden` }
            } if (subscribed === false && cumulative.months === 0) {
                return { 'say': `${sender}, ${username} has not subbed to this channel` }
            } if (subscribed === false) {
                let endsAt = await utils.time(cumulative.end)
                return { 'say': `${sender}, ${username} is not currently subbed to this channel, but has previously subbed ${cumulative.months} months. This sub ended ${endsAt} ago` }
            }
            let endsAt = await utils.time(meta.endsAt)
            if (meta.type === 'gift') {
                return { 'say': `${sender}, ${username} is currently subbed to this channel with a gifted tier ${meta.tier} sub from ${meta.gift.name}, for a total of ${cumulative.months} months and a streak of ${streak.months} months. ${meta.endsAt ? `This sub ends in ${endsAt}` : `This sub is permanent`}.` }
            } if (meta.type === 'prime') {
                return { 'say': `${sender}, ${username} is currently subbed to this channel with a prime sub, for a total of ${cumulative.months} months and a streak of ${streak.months} months. ${meta.endsAt ? `This sub ends in ${endsAt}` : `This sub is permanent`}.` }
            }
            return { 'say': `${sender}, ${username} is currently subbed to this channel with a tier ${meta.tier} sub, for a total of ${cumulative.months} months and a streak of ${streak.months} months. ${meta.endsAt ? `This sub ends in ${endsAt}` : `This sub is permanent`}.` }
        }
        else {
            const res = await fetch(`https://api.ivr.fi/twitch/subage/${message[1]}/${message[2]}`, options)
            const data = await res.json()
            if (data.error === 'No data found. User is probably banned.') {
                return { 'say': `${sender}, ${message[1]}'s data couldn't be found. They are probably banned` }
            } if (data.status === 500) {
                return { 'say': `${sender}, Something went wrong getting this information!` }
            }
            const { username, channel, hidden, subscribed, meta, cumulative, streak } = data
            if (hidden) {
                return { 'say': `${sender}, ${username} has their sub info hidden` }
            } if (subscribed === false && cumulative.months === 0) {
                return { 'say': `${sender}, ${username} has not subbed to ${channel}` }
            } if (subscribed === false) {
                let endsAt = await utils.time(cumulative.end)
                return { 'say': `${sender}, ${username} is not currently subbed to ${channel}, but has previously subbed ${cumulative.months} months. This sub ended ${endsAt} ago` }
            }
            let endsAt = await utils.time(meta.endsAt)
            if (meta.type === 'gift') {
                return { 'say': `${sender}, ${username} is currently subbed to ${channel} with a gifted tier ${meta.tier} sub from ${meta.gift.name}, for a total of ${cumulative.months} months and a streak of ${streak.months} months. ${meta.endsAt ? `This sub ends in ${endsAt}` : `This sub is permanent`}.` }
            } if (meta.type === 'prime') {
                return { 'say': `${sender}, ${username} is currently subbed to ${channel} with a prime sub, for a total of ${cumulative.months} months and a streak of ${streak.months} months. ${meta.endsAt ? `This sub ends in ${endsAt}` : `This sub is permanent`}.` }
            }
            return { 'say': `${sender}, ${username} is currently subbed to ${channel} with a tier ${meta.tier} sub, for a total of ${cumulative.months} months and a streak of ${streak.months} months. ${meta.endsAt ? `This sub ends in ${endsAt}` : `This sub is permanent`}.` }
        }
    },
    userCooldown: 10000,
    chanCooldown: 0,
    description: `Returns the sub age of a user to a channel. Usage: *sa [user 1] [user 2], Examples: *sa - sub age of sender to current channel, *sa doodole_ - sub age of user 1 to current channel, *sa doodole_ forsen - sub age of user 1 to user 2`,
    permissions: `global`

}