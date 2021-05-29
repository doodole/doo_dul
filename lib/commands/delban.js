const utils = require(`../utils.js`)
var mysql = require(`mysql`);

const con = utils.con

module.exports = {
    name: 'delban',
    alias: [],
    code: async (chan, chanUID, sender, senderUID, message) => {
        const delban = message.slice(1).join(' ');
        const sql =  `DELETE FROM banphrases WHERE channelUID = ${mysql.escape(chanUID)} AND banphrase = ${mysql.escape(delban)}`;
        const result = await utils.query(sql)
        if (result.affectedRows === 0) {
            return {'say': `${sender}, No such banphrase was found ForsenLookingAtYou`};
        } else {
            console.log(`Banphrase Removed!`);
            return {'say': `${sender}, Banphrase removed!`};
        };
    },
    userCooldown : 0,
    chanCooldown : 0,
    description : `Delete a banned phrase in a channel`,
    permissions: `mods`
}