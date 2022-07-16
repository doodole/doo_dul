import "dotenv/config";
import { Client } from "tmi.js";
import { Bot } from "./bot/Bot";

const client = new Client({
    identity: {
        username: process.env.BOT_NAME,
        password: process.env.OAUTH_TOKEN
    },
    // TODO: Pull this from db
    channels: ['doodole_', 'doo_dul']
});

const bot = new Bot(client);

bot.run();
