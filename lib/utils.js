const fetch = require('node-fetch')
var mysql = require(`mysql2`);
const util = require('util')
const Twitch = require("dank-twitch-irc")
require('dotenv').config({path: '../.env'})

var cooldowns = [];

exports.Cooldown = (sender, chan, chancd, usercd, commandName) => {
  if (cooldowns.includes(`${chan}${commandName}`)) {return ['cooldown'];}
  if (cooldowns.includes(`${sender}_${commandName}`)) {return ['cooldown'];}
  if (cooldowns.includes(`${sender}_${commandName}`) === false && cooldowns.includes(`${chan}${commandName}`) === false) {
    cooldowns.push(`${chan}${commandName}`);
    setTimeout(() => {
      const index = cooldowns.indexOf(`${chan}${commandName}`);
      if (index > -1) {
        cooldowns.splice(index, 1);
      };
    }, chancd);
    cooldowns.push(`${sender}_${commandName}`)
    setTimeout(() => {
      const index = cooldowns.indexOf(`${sender}_${commandName}`);
      if (index > -1) {
        cooldowns.splice(index, 1);
      };
    }, usercd);
    return [];
  };
};

exports.randomNum = (min, max) => {
  return Math.floor(Math.random()*max + min)
};

const getToken = async () => {
  const options = {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      client_id: process.env.CLIENTID,
      client_secret: process.env.CLIENTSECRET,
      grant_type: 'client_credentials'
    })
  };
  const res = await fetch(`https://id.twitch.tv/oauth2/token`, options)
  const data = await res.json()
  return data.access_token
};

var AT;

(async function() {
  AT = await getToken();
  exports.AT = AT
})()

exports.getToken = getToken

exports.getUID = async (channel) => {
  const options = {
    method: 'GET',
    headers: {
      'Client-ID': process.env.CLIENTID,
      'Authorization': 'Bearer ' + AT,
    }
  }
  const res = await fetch('https://api.twitch.tv/helix/users?login='+ channel, options)
  const status = await res.status
  console.log(`Status: ${status}`)
  if (status === 401) {
    return getToken();
  }
  const data = await res.json()
  try {
    return data.data[0].id
  }
  catch (err) {
    if (err.name === 'TypeError') {
      console.log('Invalid username inputted')
      return undefined
    }
  }
};

con = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

exports.con = con
exports.query = util.promisify(con.query).bind(con);

let client = new Twitch.ChatClient({
  username: process.env.BOT_NAME,
  password: process.env.OAUTH_TOKEN,
  rateLimits: `default`,
});

client.use(new Twitch.AlternateMessageModifier(client));
client.use(new Twitch.SlowModeRateLimiter(client, 10));

exports.client = client

exports.time = async (time) => {
  let date = new Date() - new Date(time)
  if (date < 0) {
    date = new Date(time) - new Date()
  }
  const years = Math.floor(date/3.154e+10)
  const days = Math.floor((date - years*3.154e+10)/86400000)
  const hours = Math.floor((date - years*3.154e+10 - days*86400000)/3600000)
  const mins = Math.floor((date - years*3.154e+10 - days*86400000 - hours*3600000)/60000)
  const seconds = Math.floor((date - years*3.154e+10 - days*86400000 - hours*3600000 - mins*60000)/1000)
  if (years != 0) {
      return `${years}y, ${days}d, and ${hours}h`
  }
  else if (days != 0) {
      return `${days}d, ${hours}h, and ${mins}m`
  }
  else if (hours != 0) {
      return `${hours}h, ${mins}m, and ${seconds}s`
  }
  else if (mins !=0) {
      return `${mins}m and ${seconds}s`
  }
  else if (seconds != 0) {
      return `${seconds}s`
  }
}