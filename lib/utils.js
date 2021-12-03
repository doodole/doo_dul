const fetch = require('node-fetch')
var mysql = require(`mysql2`);
const Twitch = require("dank-twitch-irc")
require('dotenv').config({ path: '../.env' })

var cooldowns = [];

exports.Cooldown = (sender, chan, chancd, usercd, commandName) => {
    if (cooldowns.includes(`${chan}${commandName}`)) { return ['cooldown']; }
    if (cooldowns.includes(`${sender}_${commandName}`)) { return ['cooldown']; }
    if (cooldowns.includes(`${sender}_${commandName}`) === false && cooldowns.includes(`${chan}${commandName}`) === false) {
        cooldowns.push(`${chan}${commandName}`);
        setTimeout(() => {
            const index = cooldowns.indexOf(`${chan}${commandName}`);
            if (index > -1) {
                cooldowns.splice(index, 1);
            };
        }, chancd);
        cooldowns.push(`${sender}_${commandName}`)
        setTimeout(() => {
            const index = cooldowns.indexOf(`${sender}_${commandName}`);
            if (index > -1) {
                cooldowns.splice(index, 1);
            };
        }, usercd);
        return [];
    };
};

exports.randomNum = (min, max) => {
    return Math.floor(Math.random() * max + min)
};

const refreshToken = () => {
    const options = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            client_id: process.env.CLIENTID,
            client_secret: process.env.CLIENTSECRET,
            grant_type: 'client_credentials'
        })
    };
    fetch(`https://id.twitch.tv/oauth2/token`, options)
        .then(response =>  response.json())
        .then((data) => {
            AT = data.access_token
        })
};

refreshToken()
exports.refreshToken = refreshToken

var AT;

exports.getToken = () => {
    return AT
}

exports.getUID = async (channel) => {
    const options = {
        method: 'GET',
        headers: {
            'Client-ID': process.env.CLIENTID,
            'Authorization': 'Bearer ' + AT,
        }
    }
    const res = await fetch('https://api.twitch.tv/helix/users?login=' + channel, options)
    const status = await res.status
    console.log(`Status: ${status}`)
    if (status === 401) {
        refreshToken();
        return this.getUID(channel);
    }
    const data = await res.json()
    try {
        return data.data[0].id
    }
    catch (err) {
        if (err.name === 'TypeError') {
            console.log('Invalid username inputted')
            return undefined
        }
    }
};

con = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    charset : 'utf8mb4'
});

exports.con = con

let client = new Twitch.ChatClient({
    username: process.env.BOT_NAME,
    password: process.env.OAUTH_TOKEN,
    rateLimits: `default`,
});

client.use(new Twitch.AlternateMessageModifier(client));
client.use(new Twitch.SlowModeRateLimiter(client, 10));

exports.client = client

exports.time = async (time) => {
    let date = new Date() - new Date(time)
    if (date < 0) {
        date = new Date(time) - new Date()
    }
    const years = Math.floor(date / 3.154e+10)
    const days = Math.floor((date - years * 3.154e+10) / 86400000)
    const hours = Math.floor((date - years * 3.154e+10 - days * 86400000) / 3600000)
    const mins = Math.floor((date - years * 3.154e+10 - days * 86400000 - hours * 3600000) / 60000)
    const seconds = Math.floor((date - years * 3.154e+10 - days * 86400000 - hours * 3600000 - mins * 60000) / 1000)
    if (years != 0) {
        return `${years}y, ${days}d, and ${hours}h`
    }
    else if (days != 0) {
        return `${days}d, ${hours}h, and ${mins}m`
    }
    else if (hours != 0) {
        return `${hours}h, ${mins}m, and ${seconds}s`
    }
    else if (mins != 0) {
        return `${mins}m and ${seconds}s`
    }
    else if (seconds != 0) {
        return `${seconds}s`
    }
}

exports.messageSplitter = async (array, messageLength, startOfMessage = "") => {
    const splitMessage = {}
    let n = 0
    for (i in array) {
        if (!splitMessage.hasOwnProperty(n)) {
            splitMessage[n] = startOfMessage + array[i]
        } else {
            if (splitMessage[n].length < messageLength) {
                splitMessage[n] = splitMessage[n] + " " + array[i]
            } else {
                n = n + 1
                splitMessage[n] = startOfMessage + array[i]
            }
        }
    }
    return splitMessage
}

exports.removeEventSub = (id) => {
    fetch(`https://api.twitch.tv/helix/eventsub/subscriptions?id=${id}`, {
        method: 'DELETE',
        headers: {
            'Client-ID': process.env.CLIENTID,
            'Authorization': 'Bearer ' + AT,
        }
    })
}

var channelEmotes = {}
exports.getChannelEmotes = (chanUID) => {
    return channelEmotes[chanUID]
}

var globalEmotes = []
exports.getGlobalEmotes = () => {
    return globalEmotes
}

exports.updateChannelEmotes = async (chan, chanUID) => {
    const options = {
        method: "GET",
    }
    //bttvemotes
    let res = await fetch(`https://api.betterttv.net/3/cached/users/twitch/` + chanUID, options)
    let data = await res.json()
    const bttvemotes = []
    for (i in data.channelEmotes) {
        bttvemotes.push(data.channelEmotes[i].code)
    }
    for (i in data.sharedEmotes) {
        bttvemotes.push(data.sharedEmotes[i].code)
    }
    //ffzemotes
    res = await fetch(`https://api.frankerfacez.com/v1/room/` + chan, options)
    data = await res.json()
    const set = data.room.set
    const ffzemotes = data.sets[set].emoticons.map(i => i.name)
    //7tvemotes
    res = await fetch(`https://api.7tv.app/v2/users/${chan}/emotes`, options)
    data = await res.json()
    let seventvemotes;
    if (data.status === 404) {
        seventvemotes = []
    } else {
        seventvemotes = data.map(i => i.name)
    }
    //twitch emotes
    const twitchOptions = {
        method: 'GET',
        headers: {
            'Client-ID': process.env.CLIENTID,
            'Authorization': 'Bearer ' + AT,
        }
    }
    res = await fetch('https://api.twitch.tv/helix/chat/emotes?broadcaster_id=' + chanUID, twitchOptions)
    data = await res.json()
    const t1Emotes = data.data.filter(e => e.emote_type === 'subscriptions' && e.tier === '1000').map(e => e.name)
    const t2Emotes = data.data.filter(e => e.emote_type === 'subscriptions' && e.tier === '2000').map(e => e.name)
    const t3Emotes = data.data.filter(e => e.emote_type === 'subscriptions' && e.tier === '3000').map(e => e.name)
    const bitsEmotes = data.data.filter(e => e.emote_type === 'bitstier').map(e => e.name)
    const followerEmotes = data.data.filter(e => e.emote_type === 'follower').map(e => e.name)

    channelEmotes[chanUID] = {
        t1Emotes: t1Emotes,
        t2Emotes: t2Emotes,
        t3Emotes: t3Emotes,
        bitsEmotes: bitsEmotes,
        followerEmotes: followerEmotes,
        BTTVEmotes: bttvemotes,
        FFZEmotes: ffzemotes,
        SevenTVEmotes: seventvemotes
    }
}

exports.updateGlobalEmotes = async () => {
    //twitch emotes
    const twitchOptions = {
        method: 'GET',
        headers: {
            'Client-ID': process.env.CLIENTID,
            'Authorization': 'Bearer ' + AT,
        }
    }
    let res = await fetch('https://api.twitch.tv/helix/chat/emotes/global', twitchOptions)
    let { data } = await res.json()
    globalEmotes = data.map(e => e.name)

    const options = {
        method: 'GET'
    }

    //7tvemotes
    res = await fetch('https://api.7tv.app/v2/emotes/global', options)
    data = await res.json()
    globalEmotes = [...globalEmotes, ...data.map(e => e.name)];

    //bttvemotes
    res = await fetch('https://api.betterttv.net/3/cached/emotes/global', options)
    data = await res.json()
    globalEmotes = [...globalEmotes, ...data.map(e => e.code)];

    //ffzemotes
    res = await fetch(`https://api.frankerfacez.com/v1/set/global`, options)
    data = await res.json()

    //put into globalEmotes
    globalEmotes = [...globalEmotes, ...data.sets[4330].emoticons.map(e => e.name), ...data.sets[3].emoticons.map(e => e.name)]
}

exports.updateEmotes = async () => {
    const [channels] = await con.promise().query(
        `SELECT channel, UID
        FROM channels`
    )
    for (i in channels) {
        const channel = channels[i].channel
        const chanUID = channels[i].UID
        this.updateChannelEmotes(channel, chanUID)
    }
    this.updateGlobalEmotes()
}

exports.getBestAvailableEmote = (emotes, lastResort, chanUID) => {
    let allEmotes = globalEmotes
    for (const key in channelEmotes[chanUID]) {
        allEmotes = allEmotes.concat(channelEmotes[chanUID][key])
    }
    for (const e of emotes) {
        if (allEmotes.includes(e)) {
            return e
        }
    }
    return lastResort
}