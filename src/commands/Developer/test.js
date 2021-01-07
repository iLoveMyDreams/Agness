const BaseCommand = require('../../Utils/BaseCommand.js')
module.exports = class TestCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'test',
            alias: ['t']
        })
    }
    async run(msg, args) {
        const filter = (m) => m.author.id === msg.author.id
        const messages = await msg.channel.awaitMessages(filter, { max: 1, time: 30000, errors: ['time'] })
        console.log(messages.first().mentions.users.first())
    }
}