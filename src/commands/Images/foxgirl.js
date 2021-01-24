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
            .setColor(this.client.color)
            .setDescription(`**${msg.author.username}** aquí está tu imagen. ^^`)
            .attachFiles([new Discord.MessageAttachment((await this.client.nekos.sfw.foxGirl()).url, "AsunaFoxGirl.png")])
            .setImage('attachment://AsunaFoxGirl.png')
        msg.channel.send(embed)
    }
}