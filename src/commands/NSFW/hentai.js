const BaseCommand = require('../../Utils/BaseCommand.js')

module.exports = class HentaiCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'hentai',
            category: 'NSFW',
            nsfwOnly: true
        })
    }

    async run(msg) {
        let embed = new Discord.MessageEmbed()
            .setColor(this.client.color)
            .setDescription(`**${msg.author.username}** Disfruta de las Imágenes. ^^`)
            .attachFiles([new Discord.MessageAttachment((await this.client.nekos.nsfw.randomHentaiGif()).url, "AsunaHentai.gif")])
            .setImage('attachment://AsunaHentai.gif')
        msg.channel.send(embed)
    }
}