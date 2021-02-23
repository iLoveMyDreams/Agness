const BaseCommand = require('../../Utils/BaseCommand.js');

module.exports = class TestCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'test',
            aliases: ['emit'],
            category: 'Config',
            description: 'Do a simulation of events in the bot',
            usage: (prefix) => `${prefix}test [event: welcome/leave]`,
            example: (prefix) => `${prefix}test welcome`,
            memberGuildPermissions: ['ADMINISTRATOR']
        });
    }

    async run(msg, args) {
        if (!args[0]) return msg.channel.send('You must specify the event to test (emit - leave/welcome).');
        switch (args[0].toLowerCase()) {
            case 'leave': {
                this.client.emit('guildMemberRemove', msg.member);
                return msg.channel.send('Emitted **leave** event successfully.');
            }
            case 'welcome': {
                this.client.emit('guildMemberAdd', msg.member);
                return msg.channel.send('Emitted **welcome** event successfully.');
            }
            default:
                return msg.channel.send('You must specify the event to test (emit - leave/welcome).');
        }
    }
};