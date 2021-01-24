const BaseCommand = require('../../Utils/BaseCommand.js')

module.exports = class HugCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'hug',
            alias: ['abrazo'],
            category: 'Interact'
        })
    }

    async run(msg, args) {
        if (!args[0]) return msg.channel.send('Menciona a alguien para darle un abrazo')
        let mention = msg.guild.members.resolve(args[0]) || msg.mentions.members.first()
        if (!mention) return msg.channel.send('Menciona a alguien para darle un abrazo')
        if (mention.id === msg.author.id) return msg.channel.send('No podés abrazarte a ti mismo')
        let embed = new Discord.MessageEmbed()
            .setColor(this.client.color)
            .setDescription(`**${msg.author.username}** le dio un cálido abrazo a **${mention.user.username}**`)
            .attachFiles([new Discord.MessageAttachment((await this.client.nekos.sfw.hug()).url, "AsunaHug.gif")])
            .setImage('attachment://AsunaHug.gif')
        msg.channel.send(embed)
    }
}