import * as mysql from "mysql2";

// MySQL database connection
export const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    charset : 'utf8mb4'
});

// Finds elasped time from a date
export function time (time: number|string|Date): string {
    let date = new Date().valueOf() - new Date(time).valueOf();
    if (date < 0) {
        date = new Date(time).valueOf() - new Date().valueOf();
    }
    const years = Math.floor(date / 3.154e+10);
    const days = Math.floor((date - years * 3.154e+10) / 86400000);
    const hours = Math.floor((date - years * 3.154e+10 - days * 86400000) / 3600000);
    const mins = Math.floor((date - years * 3.154e+10 - days * 86400000 - hours * 3600000) / 60000);
    const seconds = Math.floor((date - years * 3.154e+10 - days * 86400000 - hours * 3600000 - mins * 60000) / 1000);
    if (years != 0) {
        return `${years}y, ${days}d, and ${hours}h`;
    }
    else if (days != 0) {
        return `${days}d, ${hours}h, and ${mins}m`;
    }
    else if (hours != 0) {
        return `${hours}h, ${mins}m, and ${seconds}s`;
    }
    else if (mins != 0) {
        return `${mins}m and ${seconds}s`;
    }
    else if (seconds != 0) {
        return `${seconds}s`;
    } else {
        return `0s`;
    }
}

// Storing channel info in an object
interface ChannelInfo {
    [key: string]: {uid: number, banphraseAPI: string, banphraseApiType: string}
}

var allChannelInfo: ChannelInfo = {};

// Channel info getter and setter
export function getAllChannelInfo(): ChannelInfo {
    return allChannelInfo;
}

export async function setAllChannelInfo(): Promise<void> {
    const [results] = await db.promise().query(`SELECT * FROM channels`);
    var c = Object.values(results);
    for (var i in c) {
        allChannelInfo[c[i].channel] = {
            uid: c[i].UID,
            banphraseAPI: c[i].banphraseAPI,
            banphraseApiType: c[i].apiType
        }
    }
}

let cooldowns = new Set<string>();

export function cooldown (sender: string, channel: string, chanCooldown: number, userCooldown: number, commandName: string): Boolean {
    if (cooldowns.has(`${channel}${commandName}`) || cooldowns.has(`${sender}_${commandName}`)) { 
        return true;
    }
    else {
        cooldowns.add(`${channel}${commandName}`);
        setTimeout(() => {
            cooldowns.delete(`${channel}${commandName}`);
        }, chanCooldown);
        cooldowns.add(`${sender}_${commandName}`);
        setTimeout(() => {
            cooldowns.delete(`${sender}_${commandName}`)
        }, userCooldown);
        return false;
    };
};