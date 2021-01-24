const BaseCommand = require('../../Utils/BaseCommand.js')

module.exports = class TickleCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'tickle',
            alias: ['cosquillas'],
            category: 'Interact'
        })
    }

    async run(msg, args) {
        if (!args[0]) return msg.channel.send('Menciona a alguien para hacerle cosquillas.')
        let mention = msg.guild.members.resolve(args[0]) || msg.mentions.members.first()
        if (!mention) return msg.channel.send('Menciona a alguien para hacerle cosquillas.')
        if (mention.id === msg.author.id) return msg.channel.send('No podés cosquillas a ti mismo')
        let embed = new Discord.MessageEmbed()
            .setColor(this.client.color)
            .setDescription(`**${msg.author.username}** le hace cosquillas a **${mention.user.username}**`)
            .attachFiles([new Discord.MessageAttachment((await this.client.nekos.sfw.tickle()).url, "AsunaTickle.gif")])
            .setImage('attachment://AsunaTickle.gif')
        msg.channel.send(embed)
    }
}