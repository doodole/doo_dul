import "dotenv/config";
import { Client } from "tmi.js";
import * as utils from "../utils"

utils.setAllChannelInfo();
var channelNames = Object.keys(utils.getAllChannelInfo());

export let client = new Client({
    identity: {
        username: process.env.BOT_NAME,
        password: process.env.OAUTH_TOKEN
    },
    channels: channelNames
});
