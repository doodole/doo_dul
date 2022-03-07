require('dotenv').config();
const requireDir = require('require-dir')
const commands = requireDir('./lib/commands')
const regex = require('./lib/regex')
const utils = require('./lib/utils')
const mysql = require(`mysql2`);
const fetch = require('node-fetch')
const pm2 = require('pm2')

const con = utils.con

con.connect(function (err) {
    if (err) throw err;
});

const client = utils.client

client.on("ready", () =>
    console.log("Successfully connected to twitch"),
);

client.on("close", (error) => {
    if (error !== null) {
        console.error("Client closed due to error", error);
    }
});

client.on(`JOIN`, (msg) => {
    console.log(`Successfully connected to ` + msg.channelName + "'s chat!")
});

client.on("PRIVMSG", (msg) => {
    console.log(`[#${msg.channelName}] ${msg.senderUsername}: ${msg.messageText}`);
});

// joining channels at the start
const initializeChannels = async () => {
    client.connect()
    const [results] = await con.promise().query(`SELECT channel FROM channels`)
    for (i in results) {
        client.join(results[i].channel)
        await new Promise(resolve => setTimeout(resolve, 600))
    }
}
initializeChannels()

//logging messages
client.on('PRIVMSG', async (msg) => {
    const chan = msg.channelName
    const chanUID = msg.channelID
    const sender = msg.senderUsername
    const senderUID = msg.senderUserID
    const messajj = msg.messageText
    const date = Date.now()
    con.query(
        `INSERT INTO ${"logs_" + chanUID} 
        VALUES (?, ?, ?, ?, ?, ?, NULL)`,
        [chan, chanUID, sender, senderUID, messajj, date]
    );
});

//Add new channels to database
const addChan = async (chan) => {
    const options = {
        method: 'GET',
        headers: {
            'Client-ID': process.env.CLIENTID,
            'Authorization': 'Bearer ' + utils.getToken(),
        }
    }
    const [channels] = await con.promise().query(
        `SELECT channel 
        FROM channels
        WHERE channel = ?`, 
        [chan]
    )
    if (channels.length) { return } 
    // add to channels table
    const response = await fetch(`https://api.twitch.tv/helix/users?login=` + chan, options)
    const data = await response.json()
    const channelUID = await data.data[0].id
    con.query(
        `INSERT INTO channels (channel, UID) 
        VALUES (?, ?)`, 
        [chan, channelUID],
        (err) => {
            if (err) throw err
            console.log(chan + ` was added to the database`)
        }
    )
    //create logs table
    con.query(`CREATE TABLE ${'logs_' + channelUID} LIKE logs_template`)
    // add to live table
    const liveoptions = {
        method: 'POST',
        headers: {
            'Client-ID': process.env.CLIENTID,
            'Authorization': 'Bearer ' + utils.getToken(),
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "type": "stream.online",
            "version": "1",
            "condition": {
                "broadcaster_user_id": channelUID
            },
            "transport": {
                "method": "webhook",
                "callback": process.env.LIVE_CALLBACK,
                "secret": process.env.WEBHOOKSECRET
            }
        })
    }
    const offlineoptions = {
        method: 'POST',
        headers: {
            'Client-ID': process.env.CLIENTID,
            'Authorization': 'Bearer ' + utils.getToken(),
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "type": "stream.offline",
            "version": "1",
            "condition": {
                "broadcaster_user_id": channelUID
            },
            "transport": {
                "method": "webhook",
                "callback": process.env.LIVE_CALLBACK,
                "secret": process.env.WEBHOOKSECRET
            }
        })
    }
    const postEventSub = async (option) => {
        const res = await fetch(`https://api.twitch.tv/helix/eventsub/subscriptions`, option)
        return await res.json()
    }
    const [onlinedata, offlinedata] = await Promise.all([postEventSub(liveoptions), postEventSub(offlineoptions)])
    con.query(
        `INSERT INTO live (channel, channelUID, isLive, messageLive, messageOffline, LiveID, OfflineID, notifications, peopleLive, peopleOffline) 
        VALUES (?, ?, 'false', ?, ?, ?, ?, 'no', '', '')`,
        [chan, channelUID, chan + ' has gone live PogChamp', chan + ' has gone offline FeelsBadMan', onlinedata.data[0].id, offlinedata.data[0].id]
    )
}


client.on("JOIN", async (msg) => {
    setTimeout(async () => {
        const chan = msg.channelName
        addChan(chan) 
        const liveCheck = await fetch(`https://api.twitch.tv/helix/streams?user_login=${chan}`, {
            method: 'GET',
            headers: {
                'Client-ID': process.env.CLIENTID,
                'Authorization': 'Bearer ' + utils.getToken()
            },
        })
        if (liveCheck.status === 401) {
            utils.refreshToken()
        }
        const liveCheckData = await liveCheck.json()
        if (liveCheckData.data.length) {
            con.query(
                `UPDATE live
                SET isLive = "true"
                WHERE channel = ?`, [chan]
            )
        } else {
            con.query(
                `UPDATE live
                SET isLive = "false"
                WHERE channel = ?`, [chan]
            )
        }
    }, 1500)
})

//remove channels from the database
const removeChan = async (chan) => {
    const [channels] = await con.promise().query(
        `SELECT UID
        FROM channels
        WHERE channel = ?`, 
        [chan]
    )
    if (!channels.length) {
        console.log('This channel has not been added yet')
    }
    const channelUID = channels[0].UID 
    //delete channel from channels table
    con.query(
        `DELETE FROM channels
        WHERE channel = ?`, 
        [chan], 
        (err) => {
            if (err) throw err
            console.log(chan + ' was removed from the channels table')
        }
    )
    //remove logs table
    con.query(`DROP TABLE ${'logs_' + channelUID}`)
    
    //remove live eventsub
    const [liveNotifications] = await con.promise().query(
        `SELECT LiveID, OfflineID
        FROM live
        WHERE channelUID = ?`, [channelUID]
    )
    if (liveNotifications.length) {
        utils.removeEventSub(liveNotifications[0].LiveID)
        utils.removeEventSub(liveNotifications[0].OfflineID)
        con.query(
            `DELETE FROM live 
            WHERE channelUID = ?`, [channelUID]
        )
        console.log(chan + ' was removed from the live table')
    }
    const [followNotifications] = await con.promise().query(
        `SELECT id
        FROM follownotifications
        WHERE channelUID = ?`, [channelUID]
    )
    if (followNotifications.length) {
        utils.removeEventSub(followNotifications[0].id)
        con.query(
            `DELETE FROM follownotifications 
            WHERE channelUID = ?`, [channelUID]
        )
        console.log(chan + ' was removed from the follownotifications table')
    }
}

client.on("PART", (msg) => {
    const chan = msg.channelName
    removeChan(chan)
})

//MODS
client.on(`PRIVMSG`, (msg) => {
    if (msg.badges.hasModerator === false && msg.badges.hasBroadcaster === false) {
        const banmessage = msg.messageText.replace(regex.invisChar, '').replace(/\s+/g, " ").trim();
        const chan = msg.channelName;
        const sender = msg.senderUsername;
        const chanUID = msg.channelID
        const sql = `SELECT * FROM banphrases WHERE channelUID = ` + mysql.escape(chanUID);
        con.query(sql, function (err, results) {
            if (err) throw err;
            for (i = 0; i < results.length; i++) {
                if (banmessage.toUpperCase().includes(results[i].banphrase.toUpperCase())) {
                    const banalts = [`ban`, `perma`, `permaban`]
                    if (banalts.indexOf(results[i].timeout) > -1) {
                        client.ban(chan, sender, 'Permaban phrase')
                        client.privmsg(chan, `/ban ${sender} [MODS perma]`)
                    }
                    else {
                        client.privmsg(chan, `/timeout ${sender} ${results[i].timeout} [Banned Phrase]`);
                        console.log(sender + ` was banned for saying ` + results[i].banphrase)
                    };
                };
            };
        });
    };
});

//sending messages
const sendMsg = async (channel, chanUID, msg) => {
    const sql = `SELECT * FROM banphrases WHERE channelUID = ${chanUID}`
    const [result] = await con.promise().query(sql)
    banphrases = result.map(x => x.banphrase)
    for (i = 0; i < banphrases.length; i++) {
        if (msg.toUpperCase().includes(banphrases[i].toUpperCase())) {
            client.say(channel, `Banphrase detected!`)
            return;
        }
    }
    const [apiCheck] = await con.promise().query(`SELECT * FROM channels WHERE UID = ${chanUID}`)
    if (apiCheck[0].banphraseAPI !== null && apiCheck[0].banphraseAPI !== '') {
        if (apiCheck[0].apiType === 'pajbot') {
            const options = {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "message": msg
                })
            }
            const res = await fetch(encodeURI(apiCheck[0].banphraseAPI), options)
            const data = await res.json()
            if (data.banned) {
                client.say(channel, 'banned word detected monkaS')
                return
            }
        }
    }
    try {
        client.say(channel, msg)
    } catch (e) {
        console.log(e.name)
        if (e.name === "SayError") {
            client.say(channel, msg)
        }
    }
}

//handling message types
const typeHandler = (message, chan, chanUID) => {
    for (type in message) {
        switch (type) {
            case 'say':
                if (typeof message.say === 'object' && message.say !== null) {
                    for (i in message.say) {
                        sendMsg(chan, chanUID, message.say[i])
                    }
                    return
                }
                sendMsg(chan, chanUID, message.say);
                break;
            case 'privmsg':
                client.privmsg(chan, message.privmsg)
                break;
            case 'pm2':
                if (message.pm2 === 'restart') {
                    setTimeout(() => { pm2.restart(`bot.js`) }, 500)
                    return;
                } if (message.pm2 === 'shutdown') {
                    setTimeout(() => { pm2.stop(`bot.js`) }, 500)
                    return;
                }
                break;
        }
    }
}

//handle messages
client.on(`PRIVMSG`, async (msg) => {
    const chan = msg.channelName
    const sender = msg.senderUsername
    const chanUID = msg.channelID
    const senderUID = msg.senderUserID
    const cleanMessage = msg.messageText.replace(regex.invisChar, '').replace(/\s+/g, " ").trim()
    if (sender === 'doo_dul') { return }
    const donkteabots = ['666232174', '137690566', '692489169', '738936638']
    if (cleanMessage === 'FeelsDonkMan TeaTime') {
        if (donkteabots.includes(senderUID)) { return }
        cooldown = utils.Cooldown(sender, chan, 30000, 60000, 'teadank')
        if (cooldown.length) { return }
        client.say(chan, 'TeaTime FeelsDonkMan')
    } else if (cleanMessage === 'TeaTime FeelsDonkMan') {
        if (donkteabots.includes(senderUID)) { return }
        cooldown = utils.Cooldown(sender, chan, 30000, 60000, 'danktea')
        if (cooldown.length) { return }
        client.say(chan, 'FeelsDonkMan TeaTime')
    } else if (msg.messageText[0] === `*`) {
        const message = cleanMessage.slice(1).split(` `)
        let com = commands[message[0]];
        if (com === undefined) {
            for (let [command, commandInfo] of Object.entries(commands)) {
                if (commandInfo.alias.includes(message[0])) {
                    com = commands[command]
                    break
                }
            }
        }
        if (com === undefined) { return }
        const [channelsDisabled] = await con.promise().query(
            `SELECT disabledChan
            FROM commands
            WHERE name = ?`, [com.name]
        )
        if (channelsDisabled[0].disabledChan.includes(chanUID)) { return }
        switch (com.permissions) {
            case 'global':
                {
                    cooldown = utils.Cooldown(sender, chan, com.chanCooldown, com.userCooldown, com.name)
                    if (cooldown.length) { return }
                    const output = await com.code(chan, chanUID, sender, senderUID, message)
                    typeHandler(output, chan, chanUID)
                }
                break
            case 'mods':
                if (msg.badges.hasModerator || msg.badges.hasBroadcaster || msg.senderUsername === 'doodole_') {
                    cooldown = utils.Cooldown(sender, chan, com.chanCooldown, com.userCooldown, com.name)
                    if (cooldown.length) { return }
                    const output = await com.code(chan, chanUID, sender, senderUID, message)
                    typeHandler(output, chan, chanUID)
                } else { return }
                break
            case 'me':
                if (msg.senderUsername === 'doodole_') {
                    cooldown = utils.Cooldown(sender, chan, com.chanCooldown, com.userCooldown, com.name)
                    if (cooldown.length) { return }
                    const output = await com.code(chan, chanUID, sender, senderUID, message)
                    typeHandler(output, chan, chanUID)
                } else { return }
                break
            case 'broadcaster':
                if (msg.badges.hasBroadcaster || msg.senderUsername === 'doodole_') {
                    cooldown = utils.Cooldown(sender, chan, com.chanCooldown, com.userCooldown, com.name)
                    if (cooldown.length) { return }
                    const output = await com.code(chan, chanUID, sender, senderUID, message)
                    typeHandler(output, chan, chanUID)
                } else { return }
                break
        }
    }
})

//add new commands automatically
const dbCommands = async () => {
    const commandNames = Object.keys(commands)
    const [dbCommandNames] = await con.promise().query(`SELECT name FROM commands`)
    const commandsStored = dbCommandNames.map(i => i.name)
    for (let i = 0; i < commandNames.length; i += 1) {
        const tempCommand = commands[commandNames[i]]
        if (commandsStored.includes(commandNames[i])) {
            con.query(
                `UPDATE commands
                SET aliases = ${mysql.escape(tempCommand.alias.join(', '))}, code = ${mysql.escape(tempCommand.code.toString())}, userCooldown = ${mysql.escape(tempCommand.userCooldown)}, chanCooldown = ${mysql.escape(tempCommand.chanCooldown)}, description = ${mysql.escape(tempCommand.description)}, permissions = ${mysql.escape(tempCommand.permissions)}
                WHERE name = ${mysql.escape(tempCommand.name)}`,
                (err) => { if (err) throw err; }
            );
        } else {
            con.query(
                `INSERT INTO commands
                VALUES (${mysql.escape(tempCommand.name)}, ${mysql.escape(tempCommand.alias.join(', '))}, ${mysql.escape(tempCommand.code.toString())}, ${mysql.escape(tempCommand.userCooldown)}, ${mysql.escape(tempCommand.chanCooldown)}, ${mysql.escape(tempCommand.description)}, ${mysql.escape(tempCommand.permissions)}, "")`
            )
        }
    }
    for (let i = 0; i < commandsStored.length; i += 1) {
        if (!commandNames.includes(commandsStored[i])) {
            con.query(
                `DELETE FROM commands
                WHERE name = ${mysql.escape(commandsStored[i])}`
            )
        }
    }
}
dbCommands()

//initialize emotes and update emotes every 10 minutes
setTimeout(() => {utils.updateEmotes()}, 5000)
setInterval(async () => {
    utils.updateEmotes()
}, 600000)
