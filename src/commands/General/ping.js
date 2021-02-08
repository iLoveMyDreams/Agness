const BaseCommand = require('../../Utils/BaseCommand.js');

module.exports = class PingCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'ping',
          	guildOnly: false
        });
    }

    async run(msg) {
        msg.channel.send(`Pong! ${this.client.ws.ping}ms.`);
    }
};