const BaseCommand = require('../../Utils/BaseCommand.js')

module.exports = class FoxGirlCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'foxgirl',
            category: 'Images'
        })
    }

    async run(msg) {
        let embed = new Discord.MessageEmbed()
            .setColor('#FDB2A2')
            .setDescription(`**${msg.author.username}** aquí está tu imagen. ^^`)
            .setImage((await this.client.nekos.sfw.foxGirl()).url)
        msg.channel.send(embed)
    }
}