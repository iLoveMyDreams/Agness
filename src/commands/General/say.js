const BaseCommand = require('../../Utils/BaseCommand.js')
module.exports = class SayCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'say',
            alias: ['decir']
        })
    }
    async run(msg, args) {
        if (!args[0]) return msg.channel.send('> A sos re trol ?')
        if (
            (msg.content.match(/@(everyone|here)/gi) ||
                msg.content.match(/<@&(\d{17,19})>/gi)) &&
            !msg.member.hasPermission('MENTION_EVERYONE')
        ) return msg.channel.send('> Necesitas del permiso Mencionar everyone.')
        msg.channel.send(args.join(' '))
    }
}