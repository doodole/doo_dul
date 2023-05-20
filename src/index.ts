import "dotenv/config";
import { Client } from "tmi.js";
import { Bot } from "./bot/Bot";
import { getClient, initializeClient } from "./base/client-scripts";

async function start(): Promise<void> {
    await initializeClient();
    const bot = new Bot(getClient());
    bot.run();
}

start();