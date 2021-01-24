const BaseCommand = require('../../Utils/BaseCommand.js')

module.exports = class LizardCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'lizard',
            alias: ['lagartija', 'lagarto'],
            category: 'Images'
        })
    }

    async run(msg) {
        let embed = new Discord.MessageEmbed()
            .setColor(this.client.color)
            .setDescription(`**${msg.author.username}** mira un lagarto`)
            .attachFiles([new Discord.MessageAttachment((await this.client.nekos.sfw.lizard()).url, "AsunaLagarto.png")])
            .setImage('attachment://AsunaLagarto.png')
        msg.channel.send(embed)
    }
}