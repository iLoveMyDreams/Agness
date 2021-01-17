const BaseCommand = require('../../Utils/BaseCommand.js')
module.exports = class HugCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'hug',
            alias: ['abrazo'],
            category: 'Interact'
        })
    }
    async run(msg, args) {
        if (!args[0]) return msg.channel.send('Menciona a alguien para darle un abrazo')
        let mention = msg.guild.members.resolve(args[0]) || msg.mentions.members.first()
        if (!mention) return msg.channel.send('Menciona a alguien para darle un abrazo')
        if (mention.id === msg.author.id) return msg.channel.send('No podes abrazarte a ti mismo')
        let embed = new Discord.MessageEmbed()
            .setColor('#FDB2A2')
            .setDescription(`**${msg.author.username}** le dio un calido abrazo a **${mention.user.username}**`)
            .setImage((await this.client.nekos.sfw.hug()).url)
        msg.channel.send(embed)
    }
}