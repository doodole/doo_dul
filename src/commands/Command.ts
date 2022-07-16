import { Message } from "../bot/Message";

export interface Command {
    name: string;
    alias: string[];
    userCooldown: number;
    chanCooldown: number;
    description: string;
    permissions: string;

    code: (message: Message) => Promise<string>;
}