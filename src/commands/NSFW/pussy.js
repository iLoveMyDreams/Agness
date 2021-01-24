const BaseCommand = require('../../Utils/BaseCommand.js')

module.exports = class PussyCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'pussy',
            category: 'NSFW',
            nsfwOnly: true
        })
    }

    async run(msg) {
        let embed = new Discord.MessageEmbed()
            .setColor(this.client.color)
            .setDescription(`**${msg.author.username}** Disfruta de las Imágenes. ^^`)
            .attachFiles([new Discord.MessageAttachment((await this.client.nekos.nsfw.pussy()).url, "AsunaPussy.gif")])
            .setImage('attachment://AsunaPussy.gif')
        msg.channel.send(embed)
    }
}