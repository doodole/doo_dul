import { Command } from "./Command";
import { time } from "../utils";
import { Message } from "../bot/Message";

let startTime = Date.now()

export const ping: Command = {
    name: "ping",
    alias: ["p"],
    userCooldown: 10000,
    chanCooldown: 5000,
    description: "Pings the bot. Also shows some information about the bot",
    permissions: "global",
    async code (message: Message): Promise<string> {
        return `${message.userstate.username}, yo. uptime: ${time(startTime)}`;
    },  
}