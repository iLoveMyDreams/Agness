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
            .setColor('#FDB2A2')
            .setDescription(`**${msg.author.username}** Disfruta de las Imágenes. ^^`)
            .setImage((await this.client.nekos.nsfw.feetGif()).url)
        msg.channel.send(embed)
    }
}