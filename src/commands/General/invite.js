const BaseCommand = require('../../Utils/BaseCommand.js')

module.exports = class InviteCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'invite',
            botChannelPermissions: ['EMBED_LINKS'],
        })
    }

    async run(msg, args) {
        const embed = new Discord.MessageEmbed()
        .setColor(this.client.color)
        .setDescription(`Thank you for inviting me to your server! You will not regret.
> [This is my invite link.](https://discord.com/api/oauth2/authorize?client_id=798573830645874718&permissions=8&scope=bot)
In case you have any doubts, here is the invitation link from my support server.
> [Support Server](https://discord.gg/K63NqEDm86)`)
        .setFooter('With love ❤️')
        .setTimestamp()
        msg.channel.send(embed)
    }
}