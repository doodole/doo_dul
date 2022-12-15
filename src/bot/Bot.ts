import { Client } from "tmi.js";
import { Message } from "./Message";
import * as commands from "../commands";
import { db, getAllChannelInfo } from "../utils";

export class Bot {
    private client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    public run(): void {
        this.client.connect();
        console.log("Connected to Twitch");
        this.client.on('chat', (channel, userstate, text, self) => { this.chatMessageHandler(new Message(channel, userstate, text, self)) });
    }

    // TODO: implement banphrase check
    private async chatMessageHandler(message: Message): Promise<void> {
        this.addLog(message);

        if(message.self) {
            return;
        } 
        
        if (message.text[0].startsWith("*")) {
            const possibleCommand = message.text.split(" ")[0].substring(1);
            const command = this.checkCommand(possibleCommand);
            if (command) {
                const commandResult = await commands[command as keyof typeof commands].code(message);
                this.client.say(message.channel, commandResult);
            }
        }
    }

    private checkCommand(command: string): string {
        if (command in commands) {
            return command;
        } else {
            let alias = this.isAlias(command);
            if (alias.isAlias) {
                return alias.commandName;
            }
            return ""
        }
    }

    // Checks if a word is a command alias and returns the actual command name
    private isAlias(alias: string): {isAlias: boolean, commandName: string} {
        let aliasStatus = {
            isAlias: false, 
            commandName: ""
        }
        Object.entries(commands).forEach(([c, commandProperties]) => {
            if (commandProperties.alias.includes(alias)) {
                aliasStatus = {
                    isAlias: true,
                    commandName: commandProperties.name
                };
            }
        });
        return aliasStatus;
    }

    // Logs message in database.
    private async addLog(message: Message): Promise<void> {
        if (message.self) {
            const channelUID = getAllChannelInfo()[message.channel].uid
            db.query(
                `INSERT INTO ${"logs_" + channelUID} 
                VALUES (?, ?, ?, ?, ?, ?, NULL)`,
                [message.channel, channelUID, process.env.BOT_NAME, process.env.BOT_UID, message.text, Date.now()] 
            )
            return;
        }
        let { 'room-id': channelUID, username, 'user-id': senderUID } = message.userstate;
        db.query(
            `INSERT INTO ${"logs_" + channelUID} 
            VALUES (?, ?, ?, ?, ?, ?, NULL)`,
            [message.channel, channelUID, username, senderUID, message.text, Date.now()]
        );
    }
}
