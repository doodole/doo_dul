const utils = require('../utils')

let start_date = Date.now()

module.exports =  {
  name : 'ping',
  alias: [],
  code : async (chan, chanUID, sender, senderUID, message) => {
    const elapsed = await utils.time(start_date)
    return  {'say':`${sender}, yo. uptime: ${elapsed}`}
  },
  userCooldown : 10000,
  chanCooldown : 5000,
  description : `Pings the bot. Also shows some information about the bot`,
  permissions: `global`
}