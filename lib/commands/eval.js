const utils = require(`../utils`)
const sfetch = require('sync-fetch')
const requireDir = require('require-dir')
const commands = requireDir('.')
const regex = require('../regex')
const mysql = require(`mysql2`);

const con = utils.con

module.exports = {
    name: 'eval',
    alias: [],
    code: async (chan, chanUID, sender, senderUID, message) => {
        const code = message.slice(1).join(' ')
        console.log(code)
        let result;
        try {
            result = eval(code)
        } catch (error) {
            result = error
        }
        return { 'say': `${result}` }
    },
    userCooldown: 0,
    chanCooldown: 0,
    description: `eval command`,
    permissions: `me`
}