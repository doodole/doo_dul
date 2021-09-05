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
				return { 'say': `You have not enabled follow notifications ForsenLookingAtYou` };
			}
			utils.removeEventSub(followNotifications[0].id)
			con.query(
				`DELETE FROM follownotifications 
				WHERE channel = ?`, [chan]
			)
			return { 'say': 'You have disabled follow notifications!' }
		}
		if (message[1] === 'live') {
			const [liveNotifications] = await con.promise().query(
				`SELECT LiveID, OfflineID
				FROM live
				WHERE channel = ?`, [chan]
			)
			if (liveNotifications.length === 0) {
				return { 'say': `You have not enabled live notifications ForsenLookingAtYou` };
			}
			utils.removeEventSub(liveNotifications[0].LiveID)
			utils.removeEventSub(liveNotifications[0].OfflineID)
			con.query(
				`DELETE FROM live 
				WHERE channel = ?`, [chan]
			)
			return { 'say': 'You have disabled live and offline notifications!' }
		}

	},
	userCooldown: 0,
	chanCooldown: 0,
	description: `Disable follow notifications on your channel`,
	permissions: `broadcaster`
}