const BaseCommand = require('../../Utils/BaseCommand.js')

module.exports = class CatCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'pfp-random',
            alias: ['avatar-random'],
            category: 'Images'
        })
    }

    async run(msg) {
        let embed = new Discord.MessageEmbed()
            .setColor(this.client.color)
            .setDescription(`**${msg.author.username}** aquí tienes un avatar random.`)
            .attachFiles([new Discord.MessageAttachment((await this.client.nekos.sfw.avatar()).url, "AsunaAvatar.png")])
            .setImage('attachment://AsunaAvatar.png')
        msg.channel.send(embed)
    }
}