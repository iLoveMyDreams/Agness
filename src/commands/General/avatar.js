const BaseCommand = require('../../Utils/BaseCommand.js')

module.exports = class AvatarCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'avatar',
            alias: ['av', 'pfp', 'foto']
        })
    }

    async run(msg, args) {
        const user = msg.mentions.users.first() || (await this.client.users.fetch(args[0], false, true)) ||
            this.client.users.cache.find(a => a.username === args.join(' ')) ||
            this.client.users.cache.find(a => a.tag === args.join(' ')) || msg.author;
        const embed = new Discord.MessageEmbed()
            .setColor(this.client.color)
            .setDescription(`Avatar de **${user.tag}**
> [Link del Avatar](${user.displayAvatarURL({ dynamic: true, size: 2048 })})`)
            .setImage(user.displayAvatarURL({ dynamic: true, size: 2048 }))
        msg.channel.send(embed)
    }
}