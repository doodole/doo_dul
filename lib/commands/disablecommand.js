const utils = require(`../utils.js`)

const con = utils.con

module.exports = {
    name: 'disablecommand',
    alias: ['disable'],
    code: async (chan, chanUID, sender, senderUID, message) => {
        const command = message[1].toLowerCase()
        const [channelsDisabled] = await con.promise().query(
            `SELECT disabledChan 
            FROM commands
            WHERE name = ?`, [command]
        )
        if (channelsDisabled.length === 0) {
            return { 'say': 'This command does not exist. Make sure you are using the actual command name, not an alias (command names can be found here: https://doodul.xyz/commands)' }
        } else if (channelsDisabled[0].disabledChan.includes(chanUID)) {
            return { 'say': 'This command has already been disabled here' }
        }
        con.query(
            `UPDATE commands 
            SET disabledChan = CONCAT(disabledChan, ?) 
            WHERE name = ?`, [chanUID + ' ', command]
        )
        return { 'say': 'This command has been disabled' }
    },
    userCooldown: 0,
    chanCooldown: 0,
    description: `Disable a command`,
    permissions: `mods`
}