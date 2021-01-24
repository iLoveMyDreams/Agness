const BaseCommand = require('../../Utils/BaseCommand.js')

module.exports = class CatCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'cat',
            alias: ['gato', 'gatos'],
            category: 'Images'
        })
    }

    async run(msg) {
        let embed = new Discord.MessageEmbed()
            .setColor(this.client.color)
            .setDescription(`**${msg.author.username}** mira un gatito`)
            .attachFiles([new Discord.MessageAttachment((await this.client.nekos.sfw.meow()).url, "AsunaCat.png")])
            .setImage('attachment://AsunaCat.png')
        msg.channel.send(embed)
    }
}