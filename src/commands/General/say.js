const BaseCommand = require('../../Utils/BaseCommand.js')

module.exports = class SayCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'say',
            alias: ['decir']
        })
    }

    async run(msg, args) {
        if (msg.deletable) await msg.delete();
        if (!args[0]) return msg.channel.send('> Ah, so you\'re troll?')
        if (
            (msg.content.match(/@(everyone|here)/gi) ||
                msg.content.match(/<@&(\d{17,19})>/gi)) &&
            !msg.member.hasPermission('MENTION_EVERYONE')
        ) return msg.channel.send('> You must have the permission of mention everyone to execute this command.')
        msg.channel.send(args.join(' '))
    }
}