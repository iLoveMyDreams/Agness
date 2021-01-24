const BaseCommand = require('../../Utils/BaseCommand.js')

module.exports = class SpankCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'spank',
            category: 'NSFW',
            nsfwOnly: true
        })
    }

    async run(msg) {
        let embed = new Discord.MessageEmbed()
            .setColor(this.client.color)
            .setDescription(`**${msg.author.username}** Disfruta de las Imágenes. ^^`)
            .attachFiles([new Discord.MessageAttachment((await this.client.nekos.nsfw.spank()).url, "AsunaSpank.gif")])
            .setImage('attachment://AsunaSpank.gif')
        msg.channel.send(embed)
    }
}