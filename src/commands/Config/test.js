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
                msg.channel.send(`> Uso correcto: ${this.prefix}test [welcome/leave]`)
                break;
            }
        }
    }
}