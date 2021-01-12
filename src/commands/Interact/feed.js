const BaseCommand = require('../../Utils/BaseCommand.js')
module.exports = class FeedCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'feed',
            alias: ['comida'],
            category: 'Interac'
        })
    }
    async run(msg, args) {
        if(!args[0]) return msg.channel.send('Menciona a alguien para darle de comer ^^')
        let mention = msg.guild.members.resolve(args[0]) || msg.mentions.members.first()
        if(!mention) return msg.channel.send('Menciona a alguien para darle de comer ^^')
        if(mention.id === msg.author.id) return msg.channel.send('No podes darte de comer a ti mismo')
        let embed = new Discord.MessageEmbed()
        .setColor('#FDB2A2')
        .setDescription(`**${msg.author.username}** le dio de comer a **${mention.user.username}**`)
        .setImage((await this.client.nekos.sfw.feed()).url)
        msg.channel.send(embed)
    }
}