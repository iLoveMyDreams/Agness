const BaseCommand = require('../../Utils/BaseCommand.js')
module.exports = class KuniCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'kuni',
            category: 'NSFW',
            nsfwOnly: true
        })
    }
    async run(msg, args) {

        let embed = new Discord.MessageEmbed()
        .setColor('#FDB2A2')
        .setDescription(`**${msg.author.username}** Disfruta de las Imagenes. ^^`)
        .setImage((await this.client.nekos.nsfw.kuni()).url)
        msg.channel.send(embed)
    }
}