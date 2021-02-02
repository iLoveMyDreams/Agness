const BaseCommand = require('../../Utils/BaseCommand.js')

module.exports = class TestCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'test',
            alias: ['emit'],
            category: 'Config',
            description: 'Do a simulation of events in the bot',
            usage: (prefix) => `${prefix}test [event: welcome/leave]`,
            example: (prefix) => `${prefix}test welcome`,
            memberGuildPermissions: ['ADMINISTRATOR']
        })
    }

    async run(msg, args) {
        switch (args[0]) {
            case 'leave': {
                this.client.emit('guildMemberRemove', msg.member)
                break;
            }
            case 'welcome': {
                this.client.emit('guildMemberAdd', msg.member)
                break;
            }
            default: {
                msg.channel.send(`> Correct use: ${this.prefix}test [welcome/leave]`)
                break;
            }
        }
    }
}