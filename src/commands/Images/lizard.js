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
            .setColor('#FDB2A2')
            .setDescription(`**${msg.author.username}** mira un lagarto`)
            .setImage((await this.client.nekos.sfw.lizard()).url)
        msg.channel.send(embed)
    }
}