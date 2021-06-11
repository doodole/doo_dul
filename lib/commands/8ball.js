module.exports = {
    name: "8ball",
    alias: ["8"],
    code: async (chan, chanUID, sender, senderUID, message) => {
        if (message[1] === undefined) {
            return { say: `${sender}, Are you going to ask for something? ForsenLookingAtYou` }
        }
        var ballmessages = [
            `As I see it, yes :)`,
            `Ask again later ForsenLookingAtYou`,
            `Better not tell you now ForsenLookingAtYou`,
            `Cannot predict now ForsenLookingAtYou`,
            `Concentrate and ask again ForsenLookingAtYou`,
            `Don’t count on it :)`,
            `It is certain :)`,
            `It is decidedly so :)`,
            `Most likely :)`,
            `My reply is no :)`,
            `My sources say no :)`,
            `Outlook not so good FeelsBadMan`,
            `Outlook good FeelsGoodMan`,
            `Reply hazy, try again ForsenLookingAtYou`,
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
    userCooldown: 0,
    chanCooldown: 0,
    description: `Gives a random 8ball message`,
    permissions: `global`,
};
