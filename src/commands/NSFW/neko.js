const BaseCommand = require('../../Utils/BaseCommand.js')

module.exports = class NekoCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'neko',
            category: 'NSFW',
            nsfwOnly: true
        })
    }

    async run(msg) {
        let embed = new Discord.MessageEmbed()
            .setColor(this.client.color)
            .setDescription(`**${msg.author.username}** Disfruta de las Imágenes. ^^`)
            .setImage((await this.client.nekos.nsfw.nekoGif()).url)
            .attachFiles([new Discord.MessageAttachment((await this.client.nekos.nsfw.nekoGif()).url, "AsunaNeko.gif")])
            .setImage('attachment://AsunaNeko.gif')
        msg.channel.send(embed)
    }
}