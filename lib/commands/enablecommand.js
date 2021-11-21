const utils = require(`../utils.js`)

const con = utils.con

module.exports = {
    name: 'enablecommand',
    alias: ['enable'],
    code: async (chan, chanUID, sender, senderUID, message) => {
        const command = message[1].toLowerCase()
        const [channelsDisabled] = await con.promise().query(
            `SELECT disabledChan 
            FROM commands
            WHERE name = ?`, [command]
        )
        if (channelsDisabled.length === 0) {
            return { 'say': 'This command does not exist. Make sure you are using the actual command name, not an alias (command names can be found here: https://doodul.xyz/commands)' }
        } else if (!channelsDisabled[0].disabledChan.includes(chanUID)) {
            return { 'say': `This command is already enabled` }
        }
        con.query(
            `UPDATE commands 
            SET disabledChan = REPLACE(disabledChan, ?, '') 
            WHERE name = ?`, [chanUID + ' ', command]
        )
        return { 'say': `This command is now enabled` }

    },
    userCooldown: 10000,
    chanCooldown: 0,
    description: `Re-enable a command`,
    permissions: `mods`
}