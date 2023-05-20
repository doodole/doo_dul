import "dotenv/config";
import { Client } from "tmi.js";
import { Bot } from "./bot/Bot";
import { client } from "./base/client";

async function start(): Promise<void> {
    const bot = new Bot(client);
    bot.run();
}

start();