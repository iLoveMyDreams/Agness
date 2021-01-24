const BaseCommand = require('../../Utils/BaseCommand.js')

module.exports = class CuddleCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'cuddle',
            alias: ['cariño'],
            category: 'Interact'
        })
    }

    async run(msg, args) {
        if (!args[0]) return msg.channel.send('Menciona a alguien para darle mucho amor y cariño')
        let mention = msg.guild.members.resolve(args[0]) || msg.mentions.members.first()
        if (!mention) return msg.channel.send('Menciona a alguien para darle mucho amor y cariño')
        if (mention.id === msg.author.id) return msg.channel.send('No podés darte amor a ti mismo :(')
        let embed = new Discord.MessageEmbed()
            .setColor(this.client.color)
            .setDescription(`**${msg.author.username}** le hace cariñitos a **${mention.user.username}**`)
            .attachFiles([new Discord.MessageAttachment((await this.client.nekos.sfw.cuddle()).url, "AsunaCuddle.gif")])
            .setImage('attachment://AsunaCuddle.gif')
        msg.channel.send(embed)
    }
}