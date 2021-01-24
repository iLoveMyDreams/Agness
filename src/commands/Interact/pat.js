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
        if (mention.id === msg.author.id) return msg.channel.send('No podés darte palmaditas a ti mismo')
        let embed = new Discord.MessageEmbed()
            .setColor(this.client.color)
            .setDescription(`**${msg.author.username}** le da palmaditas a **${mention.user.username}**`)
            .attachFiles([new Discord.MessageAttachment((await this.client.nekos.sfw.pat()).url, "AsunaPat.gif")])
            .setImage('attachment://AsunaPat.gif')
        msg.channel.send(embed)
    }
}