const BaseCommand = require('../../Utils/BaseCommand.js')
module.exports = class PingCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'ping'
        })
    }

    async run(msg, args) {
        msg.channel.send(this.client.ws.ping + 'ms')
    }
}