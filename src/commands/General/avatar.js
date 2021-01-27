const BaseCommand = require('../../Utils/BaseCommand.js')
module.exports = class AvatarCommand extends BaseCommand {
    constructor(client) {
      super(client, {
        name: "avatar",
        alias: ["av", "pfp", "foto"],
      });
    }

    async run(msg, args) {
        let user = msg.mentions.users.first() ||
            this.client.users.cache.get(args[0]) ||
            this.client.users.cache.find(e => (e.username == args.join(" ")) || (e.tag == args.join(" "))) ||
            (msg.guild ? (msg.guild.members.cache.find(e => (e.nickname === args.join(" ")))) : undefined) ||
            (args[0] ? await this.client.users.fetch(args[0]).catch(() => { }) : undefined) || msg.author;
        if (user instanceof Discord.GuildMember) {
            user = user.user;
        }
        const embed = new Discord.MessageEmbed()
            .setColor(this.client.color)
            .setDescription(`Avatar de **${user.tag}**
> [Link del Avatar](${user.displayAvatarURL({ dynamic: true, size: 4096 })})`)
            .setImage(user.displayAvatarURL({ dynamic: true, size: 4096 }))
        msg.channel.send(embed)
    }
}