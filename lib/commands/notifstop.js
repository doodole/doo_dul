const utils = require(`../utils.js`)
var mysql = require(`mysql2`);
const fetch = require('node-fetch')

const con = utils.con

module.exports = {
	name: 'notifstop',
	alias: [],
	code: async (chan, chanUID, sender, senderUID, message) => {
		if (message[1] === 'follow') {
			const [followNotifications] = await con.promise().query(
				`SELECT id
				FROM follownotifications
				WHERE channel = ?`, [chan]
			)
			if (followNotifications.length === 0) {
				return { 'say': `You have not enabled follow notifications ${utils.getBestAvailableEmote(['ForsenLookingAtYou', 'Stare'], ':Z')}` };
			}
			utils.removeEventSub(followNotifications[0].id)
			con.query(
				`DELETE FROM follownotifications 
				WHERE channel = ?`, [chan]
			)
			return { 'say': 'You have disabled follow notifications!' }
		}
		if (message[1] === 'live') {
			const [channels] = await con.promise().query(
				`SELECT notifications
				FROM live
				WHERE channel = ?`, [chan]
			)
			if (channels[0].notifications === "no") {
				return { 'say': `You have not enabled live notifications ${utils.getBestAvailableEmote(['ForsenLookingAtYou', 'Stare'], ':Z')}` };
			}
			con.query(
				`UPDATE live 
				SET notifications = 'no' 
				WHERE channelUID = ?`, [chanUID]
			)
			return { 'say': 'You have disabled live and offline notifications!' }
		}

	},
	userCooldown: 0,
	chanCooldown: 0,
	description: `Disable follow notifications on your channel`,
	permissions: `broadcaster`
}