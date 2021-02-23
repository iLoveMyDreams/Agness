const BaseCommand = require('../../Utils/BaseCommand.js');

module.exports = class SayCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'say',
            aliases: ['decir'],
            usage: (prefix) => `${prefix}say [Content]`
        });
    }

    async run(msg, args) {
        if (msg.deletable) await msg.delete();
        if (!args[0]) return msg.channel.send('Give me a text that you want me to say.');
        if ((msg.content.match(/@(everyone|here)/gi) ||
            msg.content.match(/<@&(\d{17,19})>/gi)) &&
            !msg.member.permissions.has('MENTION_EVERYONE')) return msg.channel.send('You must have the permission of mention everyone to execute this command.');
        return msg.channel.send(args.join(' '));
    }
};