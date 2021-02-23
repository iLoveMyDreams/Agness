const BaseCommand = require('../../Utils/BaseCommand.js');

module.exports = class PingCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'ping'
        });
    }

    async run(msg) {
        return msg.channel.send(`Pong! ${this.client.ws.ping}ms.`);
    }
};