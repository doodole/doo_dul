import "dotenv/config";
import { Client } from "tmi.js";
import * as utils from "../utils"

let client: Client;

export async function initializeClient(): Promise<void> {
    // set channel info and get all channel names
    await utils.setAllChannelInfo();
    var channelNames = Object.keys(utils.getAllChannelInfo());
    
    // add credentials and channels
    client = new Client({
        identity: {
            username: process.env.BOT_NAME,
            password: process.env.OAUTH_TOKEN
        },
        channels: channelNames
    });
}

export function getClient(): Client {
    return client;
}
