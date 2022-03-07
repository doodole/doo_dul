const { getBestAvailableEmote } = require (`../utils.js`)

module.exports = {
    name: "8ball",
    alias: [],
    code: async (chan, chanUID, sender, senderUID, message) => {
        if (message[1] === undefined) {
            return { say: `${sender}, Are you going to ask for something? ${getBestAvailableEmote(['ForsenLookingAtYou', 'Stare'], ':)')}` }
        }
        var ballmessages = [
            `As I see it, yes :)`,
            `Ask again later ${getBestAvailableEmote(['ForsenLookingAtYou', 'Stare'], ':)')}`,
            `Better not tell you now ${getBestAvailableEmote(['ForsenLookingAtYou', 'Stare'], ':)')}`,
            `Cannot predict now ${getBestAvailableEmote(['ForsenLookingAtYou', 'Stare'], ':\\')}`,
            `Concentrate and ask again ${getBestAvailableEmote(['ForsenLookingAtYou', 'Stare'], ':\\')}`,
            `Don’t count on it :\\`,
            `It is certain :)`,
            `It is decidedly so :)`,
            `Most likely :)`,
            `My reply is no :)`,
            `My sources say no :)`,
            `Outlook not so good FeelsBadMan`,
            `Outlook good FeelsGoodMan`,
            `Reply hazy, try again ${getBestAvailableEmote(['ForsenLookingAtYou', 'Stare'], ':\\')}`,
            `Signs point to yes :)`,
            `Very doubtful :)`,
            `Without a doubt :)`,
            `Yes :)`,
            `Yes – definitely :)`,
            `You may rely on it :)`,
        ]
        randBallMessage = ballmessages[Math.floor(Math.random() * ballmessages.length)]
        return { say: `${sender}, ${randBallMessage}` }
    },
    userCooldown: 5000,
    chanCooldown: 0,
    description: `Gives a random 8ball message`,
    permissions: `global`,
};
