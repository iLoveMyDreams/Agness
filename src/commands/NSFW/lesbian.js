const BaseCommand = require('../../Utils/BaseCommand.js')
module.exports = class LesbianCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'lesbian',
            category: 'NSFW',
            nsfwOnly: true
        })
    }
    async run(msg, args) {

        let embed = new Discord.MessageEmbed()
        .setColor('#FDB2A2')
        .setDescription(`**${msg.author.username}** Disfruta de las Imagenes. ^^`)
        .setImage((await this.client.nekos.nsfw.lesbian()).url)
        msg.channel.send(embed)
    }
}