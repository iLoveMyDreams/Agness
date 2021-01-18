const BaseCommand = require('../../Utils/BaseCommand.js')
module.exports = class CuddleCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'cuddle',
            alias: ['cariño'],
            category: 'Interact'
        })
    }

    async run(msg, args) {
        if (!args[0]) return msg.channel.send('Menciona a alguien para darle mucho amor y cariño')
        let mention = msg.guild.members.resolve(args[0]) || msg.mentions.members.first()
        if (!mention) return msg.channel.send('Menciona a alguien para darle mucho amor y cariño')
        if (mention.id === msg.author.id) return msg.channel.send('No podés darte amor a ti mismo :(')
        let embed = new Discord.MessageEmbed()
            .setColor('#FDB2A2')
            .setDescription(`**${msg.author.username}** le hace cariñitos a **${mention.user.username}**`)
            .setImage((await this.client.nekos.sfw.cuddle()).url)
        msg.channel.send(embed)
    }
}