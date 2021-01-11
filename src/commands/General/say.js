const BaseCommand = require('../../Utils/BaseCommand.js')
module.exports = class SayCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'say',
            alias: ['decir']
        })
    }
    async run(msg, args) {
        console.log((msg.mentions.everyone || 
            msg.mentions.roles.size > 0) && 
            !msg.member.hasPermission('MENTION_EVERYONE'))
        if(
            (msg.mentions.everyone || 
            msg.mentions.roles.size > 0) && 
            !msg.member.hasPermission('MENTION_EVERYONE')
        ) return msg.channel.send('> Necesitas del permiso Mencionar everyone.')
        msg.channel.send(args.join(' '))
    }
}