require('dotenv').config();
const requireDir = require('require-dir')
const commands = requireDir('./lib/commands')
const regex = require('./lib/regex')
const utils = require('./lib/utils')
const mysql = require(`mysql2`);
const fetch = require('node-fetch')
const pm2 = require('pm2')

const con = utils.con
const donkteabots = ['G0ldfishbot', 'magichack_', 'ron__bot']

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
    console.log(`[#${msg.channelName}] ${msg.displayName}: ${msg.messageText}`);
});

// joining channels
const iniChan = async () => {
    channelsql = `SELECT channel FROM channels`
    const [results] = await con.promise().query(channelsql)
    const loopchannels = async () => {
        const channels = []
        for (i = 0; i < results.length; i++) {
            channels.push(results[i].channel)
        }
        return channels;
    }
    const channelsjoin = await loopchannels()

    client.connect()
    client.joinAll(channelsjoin)
}
iniChan()

//logging messages
client.on('PRIVMSG', async (msg) => {
    const chan = msg.channelName
    const chanUID = msg.channelID
    const sender = msg.displayName
    const sender_UID = msg.senderUserID
    const messajj = msg.messageText
    const date = Date.now()
    const sql = `INSERT INTO logs (channel, chanUID, sender, senderUID, message, date) VALUES (${mysql.escape(chan)}, ${mysql.escape(chanUID)}, ${mysql.escape(sender)}, ${mysql.escape(sender_UID)}, ${mysql.escape(messajj)}, ${mysql.escape(date)})`
    con.query(sql, function (err) {
        if (err) throw err;
    });
});

//Add new channels to database
const addChan = async (channel) => {
    const options = {
        method: 'GET',
        headers: {
            'Client-ID': process.env.CLIENTID,
            'Authorization': 'Bearer ' + utils.AT,
        }
    }
    const sql = `SELECT channel FROM channels`
    con.query(sql, async function (err, results) {
        if (err) throw err;
        const joinedChannels = []
        for (i = 0; i < results.length; i++) {
            joinedChannels.push(results[i].channel)
        }
        if (joinedChannels.includes(channel)) {
            return;
        } else {
            const response = await fetch(`https://api.twitch.tv/helix/users?login=` + channel, options);
            const data = await response.json();
            console.log(data)
            const id = await data.data[0].id
            const sql2 = `INSERT INTO channels (channel, UID) VALUES (${mysql.escape(channel)}, ${mysql.escape(id)})`
            con.query(sql2, function (err) {
                if (err) throw err;
                console.log(channel + ` was added to the database`)
            })
        }
    })
}

client.on("JOIN", async (msg) => {
    setTimeout(async () => {
        const chan = msg.channelName
        addChan(chan)
    }, 1000)
})

//remove channels from the database
const removeChan = (channel) => {
    const sql = `SELECT channel FROM channels`
    con.query(sql, async function (err, results) {
        if (err) throw err;
        const joinedChannels = []
        for (i = 0; i < results.length; i++) {
            joinedChannels.push(results[i].channel)
        }
        if (joinedChannels.includes(channel)) {
            const sql2 = `DELETE FROM channels WHERE channel = ${mysql.escape(channel)}`
            con.query(sql2, function (err) {
                if (err) throw err;
                console.log(channel + ` was removed from the database`)
            })
        }
        else {
            console.log(`channel has not been added yet`)
            return;
        }
    })
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
        const sender = msg.displayName;
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
    client.say(channel, msg)
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
    const sender = msg.displayName
    const chanUID = msg.channelID
    const senderUID = msg.senderUserID
    const messageReplace = msg.messageText.replace(regex.invisChar, '').replace(/\s+/g, " ").trim()
    if (sender === 'doo_dul') { return }
    if (messageReplace === 'FeelsDonkMan TeaTime') {
        if (donkteabots.includes(sender)) { return }
        cooldown = utils.Cooldown(sender, chan, 30000, 60000, 'teadank')
        if (cooldown.length) { return }
        client.say(chan, 'TeaTime FeelsDonkMan')
    } if (messageReplace === 'TeaTime FeelsDonkMan') {
        if (donkteabots.includes(sender)) { return }
        cooldown = utils.Cooldown(sender, chan, 30000, 60000, 'danktea')
        if (cooldown.length) { return }
        client.say(chan, 'FeelsDonkMan TeaTime')
    } if (msg.messageText[0] === `*`) {
        const message = messageReplace.slice(1).split(` `);
        let com = commands[message[0]];
        if (com === undefined) {
            for (let [command, info] of Object.entries(commands)) {
                if (info.alias.includes(message[0])) {
                    com = commands[command]
                    break
                }
            }
        } if (com === undefined) { return }
        switch (com.permissions) {
            case 'global':
                {
                    cooldown = utils.Cooldown(sender, chan, com.chanCooldown, com.userCooldown, com.name)
                    if (cooldown.length) { return }
                    const output = await com.code(chan, chanUID, sender, senderUID, message)
                    typeHandler(output, chan, chanUID)
                }
                break;
            case 'mods':
                if (msg.badges.hasModerator || msg.badges.hasBroadcaster || msg.displayName === 'doodole_') {
                    cooldown = utils.Cooldown(sender, chan, com.chanCooldown, com.userCooldown, com.name)
                    if (cooldown.length) { return }
                    const output = await com.code(chan, chanUID, sender, senderUID, message)
                    typeHandler(output, chan, chanUID)
                } else { return }
                break;
            case 'me':
                if (msg.displayName === 'doodole_') {
                    cooldown = utils.Cooldown(sender, chan, com.chanCooldown, com.userCooldown, com.name)
                    if (cooldown.length) { return }
                    const output = await com.code(chan, chanUID, sender, senderUID, message)
                    typeHandler(output, chan, chanUID)
                } else { return }
                break;
            case 'broadcaster':
                if (msg.badges.hasBroadcaster || msg.displayName === 'doodole_') {
                    cooldown = utils.Cooldown(sender, chan, com.chanCooldown, com.userCooldown, com.name)
                    if (cooldown.length) { return }
                    const output = await com.code(chan, chanUID, sender, senderUID, message)
                    typeHandler(output, chan, chanUID)
                } else { return }
                break;
        }
    }
})

//raffle for -
setInterval(async () => {
    const [result] = await con.promise().query(
        `SELECT * FROM live
        WHERE channelUID = '17497365'`
    )
    if (result[0].isLive === 'true') {
        client.say('minusinsanity', '!raffle 5000')
    }
}, 3.6e+6);

//add new commands automatically
const dbCommands = async () => {
    const commandNames = Object.keys(commands)
    const [dbComNames] = await con.promise().query(`SELECT name FROM commands`)
    const commandsStored = dbComNames.map(i => i.name)
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
                `INSERT INTO commands (name, aliases, code, userCooldown, chanCooldown, description, permissions)
                VALUES (${mysql.escape(tempCommand.name)}, ${mysql.escape(tempCommand.alias.join(', '))}, ${mysql.escape(tempCommand.code.toString())}, ${mysql.escape(tempCommand.userCooldown)}, ${mysql.escape(tempCommand.chanCooldown)}, ${mysql.escape(tempCommand.description)}, ${mysql.escape(tempCommand.permissions)})`
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
