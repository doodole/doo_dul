const fetch = require('node-fetch')

module.exports = {
    name: 'ffzemotes',
    alias: [],
    code: async (chan, chanUID, sender, senderUID, message) => {
      if (chan === 'katelynerika') {return}
        const lentest = {}
        const options = {
          method: 'GET',
        }
        const res = await fetch(`https://api.frankerfacez.com/v1/room/` + chan, options)
        const data = await res.json()
        const id = data.room.set
        const dictemotes = data.sets[id].emoticons
        emotes = []
        for (i in dictemotes) {
          emotes.push(dictemotes[i].name)
        }
        let n=0
        for (i in emotes) {
          if (lentest.hasOwnProperty(n) === false) {
            lentest[n] = emotes[i]
          }
          else{
            if (lentest[n].length < 200) {
              lentest[n] = lentest[n] + ' ' + emotes[i]
            }
            else {
              n = n+1
              lentest[n] = emotes[i]
            }
          }
        }
        return {'say': lentest} ;
      },
      userCooldown : 60000,
      chanCooldown : 30000,
      description : `Returns the FFZ emotes for the channel you're in`,
      permissions: `global`

}