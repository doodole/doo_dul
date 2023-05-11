import "dotenv/config";
import { Client } from "tmi.js";
import { Bot } from "./bot/Bot";
import * as utils from "./utils"

async function start(): Promise<void> {
    // set channel info and get all channel names
    await utils.setAllChannelInfo();
    var channelNames = Object.keys(utils.getAllChannelInfo());
    
    // start and run client
    const client = new Client({
        identity: {
            username: process.env.BOT_NAME,
            password: process.env.OAUTH_TOKEN
        },
        channels: channelNames
    });

    const bot = new Bot(client);
    bot.run();
}

start();