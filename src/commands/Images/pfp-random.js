const BaseCommand = require('../../Utils/BaseCommand.js')
module.exports = class CatCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'pfp-random',
            alias: ['avatar-random'],
            category: 'Images'
        })
    }
    async run(msg, args) {

        let embed = new Discord.MessageEmbed()
            .setColor('#FDB2A2')
            .setDescription(`**${msg.author.username}** aqui tienes un avatar random.`)
            .setImage((await this.client.nekos.sfw.avatar()).url)
        msg.channel.send(embed)
    }
}