const utils = require(`../utils.js`)
var mysql = require(`mysql2`);
const fetch = require('node-fetch')

const con = utils.con

module.exports = {
	name: 'notifstop',
	alias: [],
	code: async (chan, chanUID, sender, senderUID, message) => {
		if (message[1] === 'follow') {
			const [channels] = await con.promise().query(
				`SELECT * FROM follownotifications 
				WHERE channel = ${mysql.escape(chan)}`
			)
			if (channels.length === 0) {
				return { 'say': `You have not enabled follow notifications ForsenLookingAtYou` };
			}
			const options = {
				method: 'DELETE',
				headers: {
					'Client-ID': process.env.CLIENTID,
					'Authorization': 'Bearer ' + utils.AT,
				}
			}
			console.log(channels[0].id)
			fetch(`https://api.twitch.tv/helix/eventsub/subscriptions?id=${channels[0].id}`, options)
			con.query(
				`DELETE FROM follownotifications 
				WHERE channel = ${mysql.escape(chan)}`
			)
			return { 'say': 'You have disabled follow notifications!' }
		}
		if (message[1] === 'live') {
			const [channels] = await con.promise().query(
				`SELECT * FROM live 
				WHERE channel = ${mysql.escape(chan)}`
			)
			if (channels.length === 0) {
				return { 'say': `You have not enabled live notifications ForsenLookingAtYou` };
			}
			const options = {
				method: 'DELETE',
				headers: {
					'Client-ID': process.env.CLIENTID,
					'Authorization': 'Bearer ' + utils.AT,
				}
			}
			fetch(`https://api.twitch.tv/helix/eventsub/subscriptions?id=${channels[0].LiveID}`, options)
			fetch(`https://api.twitch.tv/helix/eventsub/subscriptions?id=${channels[0].OfflineID}`, options)
			con.query(
				`DELETE FROM live 
				WHERE channel = ${mysql.escape(chan)}`
			)
			return { 'say': 'You have disabled live and offline notifications!' }
		}

	},
	userCooldown: 0,
	chanCooldown: 0,
	description: `Disable follow notifications on your channel`,
	permissions: `broadcaster`
}