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
            .setColor('#FDB2A2')
            .setDescription(`**${msg.author.username}** mira un gatito`)
            .setImage((await this.client.nekos.sfw.meow()).url)
        msg.channel.send(embed)
    }
}