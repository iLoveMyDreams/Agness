const BaseCommand = require('../../Utils/BaseCommand.js')

module.exports = class AnalCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'anal',
            category: 'NSFW',
            nsfwOnly: true
        })
    }

    async run(msg) {
        let embed = new Discord.MessageEmbed()
            .setColor(this.client.color)
            .setDescription(`**${msg.author.username}** Disfruta de las Imágenes. ^^`)
            .attachFiles([new Discord.MessageAttachment((await this.client.nekos.nsfw.anal()).url, "AsunaAnal.gif")])
            .setImage('attachment://AsunaAnal.gif')
        msg.channel.send(embed)
    }
}