const BaseCommand = require('../../Utils/BaseCommand.js')

module.exports = class FeedCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'feed',
            alias: ['comida'],
            category: 'Interact'
        })
    }

    async run(msg, args) {
        if (!args[0]) return msg.channel.send('Menciona a alguien para darle de comer ^^')
        let mention = msg.guild.members.resolve(args[0]) || msg.mentions.members.first()
        if (!mention) return msg.channel.send('Menciona a alguien para darle de comer ^^')
        if (mention.id === msg.author.id) return msg.channel.send('No podés darte de comer a ti mismo')
        let embed = new Discord.MessageEmbed()
            .setColor(this.client.color)
            .setDescription(`**${msg.author.username}** le dio de comer a **${mention.user.username}**`)
            .attachFiles([new Discord.MessageAttachment((await this.client.nekos.sfw.feed()).url, "AsunaFeed.gif")])
            .setImage('attachment://AsunaFeed.gif')
        msg.channel.send(embed)
    }
}