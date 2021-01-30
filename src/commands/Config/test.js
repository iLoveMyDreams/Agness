const BaseCommand = require('../../Utils/BaseCommand.js')

module.exports = class TestCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'test',
            alias: ['emit'],
            category: 'Config',
            memberGuildPermissions: ['ADMINISTRATOR']
        })
    }

    async run(msg, args) {
        msg.channel.send(this.client.ws.ping + 'ms')
    }
}