const BaseCommand = require('../../Utils/BaseCommand.js')
module.exports = class PatCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'pat',
            alias: ['palmaditas'],
            category: 'Interact'
        })
    }
    async run(msg, args) {
        if (!args[0]) return msg.channel.send('Menciona a alguien para darle palmaditas.')
        let mention = msg.guild.members.resolve(args[0]) || msg.mentions.members.first()
        if (!mention) return msg.channel.send('Menciona a alguien para darle palmaditas')
        if (mention.id === msg.author.id) return msg.channel.send('No podes darte palmaditas a ti mismo')
        let embed = new Discord.MessageEmbed()
            .setColor('#FDB2A2')
            .setDescription(`**${msg.author.username}** le da palmaditas a **${mention.user.username}**`)
            .setImage((await this.client.nekos.sfw.pat()).url)
        msg.channel.send(embed)
    }
}