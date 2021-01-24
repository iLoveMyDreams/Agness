const BaseCommand = require('../../Utils/BaseCommand.js')

module.exports = class FeetCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'feet',
            category: 'NSFW',
            nsfwOnly: true
        })
    }

    async run(msg) {
        let embed = new Discord.MessageEmbed()
            .setColor(this.client.color)
            .setDescription(`**${msg.author.username}** Disfruta de las Imágenes. ^^`)
            .attachFiles([new Discord.MessageAttachment((await this.client.nekos.nsfw.feetGif()).url, "AsunaFeet.gif")])
            .setImage('attachment://AsunaFeet.gif')
        msg.channel.send(embed)
    }
}