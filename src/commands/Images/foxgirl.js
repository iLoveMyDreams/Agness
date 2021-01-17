const BaseCommand = require('../../Utils/BaseCommand.js')
module.exports = class CatCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'foxgirl',
            category: 'Images'
        })
    }
    async run(msg, args) {

        let embed = new Discord.MessageEmbed()
            .setColor('#FDB2A2')
            .setDescription(`**${msg.author.username}** aqui esta tu imagen. ^^`)
            .setImage((await this.client.nekos.sfw.foxGirl()).url)
        msg.channel.send(embed)
    }
}