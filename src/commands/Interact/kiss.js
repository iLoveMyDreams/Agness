const BaseCommand = require('../../Utils/BaseCommand.js')
module.exports = class KissCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'kiss',
            alias: ['beso'],
            category: 'Interact'
        })
    }
    async run(msg, args) {
        if (!args[0]) return msg.channel.send('Menciona a alguien para darle un beso')
        let mention = msg.guild.members.resolve(args[0]) || msg.mentions.members.first()
        if (!mention) return msg.channel.send('Menciona a alguien para darle un beso')
        if (mention.id === msg.author.id) return msg.channel.send('No podes besarte a ti mismo')
        let embed = new Discord.MessageEmbed()
            .setColor('#FDB2A2')
            .setDescription(`**${msg.author.username}** le dio beso a **${mention.user.username}**`)
            .setImage((await this.client.nekos.sfw.kiss()).url)
        msg.channel.send(embed)
    }
}