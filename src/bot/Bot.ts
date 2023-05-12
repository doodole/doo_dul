import { Client } from "tmi.js";
import { Message } from "./Message";
import * as commands from "../commands";
import { db, getAllChannelInfo, cooldown } from "../utils";

export class Bot {
    private client: Client;
    private lastBotMessages: {[channel: string]: string } = {};

    constructor(client: Client) {
        this.client = client;
    }

    public run(): void {
        this.client.connect();
        console.log("Connected to Twitch");
        this.client.on('chat', (channel, userstate, text, self) => { this.chatMessageHandler(new Message(channel, userstate, text, self)) });
    }

    private async chatMessageHandler(message: Message): Promise<void> {
        this.addLog(message);
        console.log(message);

        if(message.self) {
            // set last sent message
            this.lastBotMessages[message.channel] = message.uncleanText;
            return;
        } 
        
        if (message.text[0].startsWith("*")) {
            const possibleCommand = message.text.split(" ")[0].substring(1);
            const command = this.checkCommand(possibleCommand);
            if (command) {
                const commandObject = commands[command as keyof typeof commands];

                const onCooldown = cooldown(message.sender, message.channel, commandObject.chanCooldown, commandObject.userCooldown, commandObject.name);
                if (onCooldown) {
                    return;
                }

                const commandResult = await commandObject.code(message);
                this.sendMessage(message.channel, commandResult);
            }
            return;
        } 
        
        const donkTeaBots = ['666232174', '137690566', '692489169', '738936638'];
        if (message.text === "FeelsDonkMan TeaTime" && !donkTeaBots.includes(message.userstate["user-id"] as string)) {
            const onCooldown = cooldown(message.sender, message.channel, 30000, 60000, "teadank");
            if (onCooldown) {
                return;
            }
            this.sendMessage(message.channel, "TeaTime FeelsDonkMan");
        } else if (message.text === "TeaTime FeelsDonkMan" && !donkTeaBots.includes(message.userstate["user-id"] as string)) {
            const onCooldown = cooldown(message.sender, message.channel, 30000, 60000, "danktea");
            if (onCooldown) {
                return;
            }
            this.sendMessage(message.channel, "FeelsDonkMan TeaTime");
        }
    }

    private sendMessage(channel: string, message: string): void {
        if (message === this.lastBotMessages[channel]) {
            message += " \u{E0000}";
        }
        this.client.say(channel, message)
    }

    private checkCommand(command: string): string {
        if (command in commands) {
            return command;
        } else {
            const aliasStatus = this.isAlias(command);
            if (aliasStatus.isAlias) {
                return aliasStatus.commandName;
            }
            return "";
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
                VALUES (?, ?, ?, ?, NULL)`,
                [process.env.BOT_NAME, process.env.BOT_UID, message.text, Date.now()] 
            )
            return;
        }
        let { 'room-id': channelUID, username, 'user-id': senderUID } = message.userstate;
        db.query(
            `INSERT INTO ${"logs_" + channelUID} 
            VALUES (?, ?, ?, ?, NULL)`,
            [username, senderUID, message.text, Date.now()]
        );
    }
}
