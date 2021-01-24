const BaseCommand = require('../../Utils/BaseCommand.js')

module.exports = class LesbianCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'lesbian',
            category: 'NSFW',
            nsfwOnly: true
        })
    }

    async run(msg) {
        let embed = new Discord.MessageEmbed()
            .setColor(this.client.color)
            .setDescription(`**${msg.author.username}** Disfruta de las Imágenes. ^^`)
            .setImage((await this.client.nekos.nsfw.lesbian()).url)
            .attachFiles([new Discord.MessageAttachment((await this.client.nekos.nsfw.lesbian()).url, "AsunaLesbian.gif")])
            .setImage('attachment://AsunaLesbian.gif')
        msg.channel.send(embed)
    }
}