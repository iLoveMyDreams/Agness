const BaseCommand = require('../../Utils/BaseCommand.js')

module.exports = class BoobsCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'boobs',
            category: 'NSFW',
            nsfwOnly: true
        })
    }

    async run(msg) {
        let embed = new Discord.MessageEmbed()
            .setColor(this.client.color)
            .setDescription(`**${msg.author.username}** Disfruta de las Imágenes. ^^`)
            .attachFiles([new Discord.MessageAttachment((await this.client.nekos.nsfw.boobs()).url, "AsunaBoobs.gif")])
            .setImage('attachment://AsunaBoobs.gif')
        msg.channel.send(embed)
    }
}