import { ChatUserstate } from "tmi.js";

export class Message {
    public channel: string;
    public sender: string;
    public text: string;
    public uncleanText: string;
    public userstate: ChatUserstate;
    public self: boolean;

    constructor(channel: string, userstate: ChatUserstate, text: string, self: boolean) {
        this.channel = channel.startsWith("#") ? channel.substring(1) : channel;
        this.sender = userstate.username as string;
        this.text = this.cleanMessage(text);
        this.uncleanText = this.text;
        this.userstate = userstate;
        this.self = self;
    }

    private static invisChar = new RegExp(/[\u034f\u2800\u{E0000}\u180e\ufeff\u2000-\u200d\u206D]/gu);

    private cleanMessage(text: string): string {
        return text.replace(Message.invisChar, '').replace(/\s+/g, " ").trim();
    }
}