const BaseCommand = require('../../Utils/BaseCommand.js')

module.exports = class VariablesCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'variables',
            botChannelPermissions: ['EMBED_LINKS'],
        })
    }

    async run(msg) {
        const embed = new Discord.MessageEmbed()
            .setTitle(`${this.client.user.username} Variables`)
            .setDescription('These variables can be used when editing embeds and in welcome/leave messages.')
            .addField('User Information',
                `\`{user}\` - @Mention (e.j. @Aviii.#0721 ❤️)
\`{user.name}\` - Username (e.j. Aviii.)
\`{user.discrim}\` - User tag (e.j. 0721)
\`{user.nick}\` - Member's nickname, if none, it will show 'No nickname.'
\`{user.createdate}\` - Account creation date
\`{user.joindate}\` - Date you joined the server
\`{user.id}\` - User ID (e.j. 710880777662890095)
\`{user.avatar}\` - Link to the user avatar`)
            .addField('Server Information',
                `\`{server}\` - Server name (e.j. ${this.client.user.username}'s Support)
\`{server.prefix}\` - Server prefix (by default, a?)
\`{server.id}\` - Server ID (e.j. 773629394894848030)
\`{server.membercount}\` - Number of total members
\`{server.membercount.nobots}\` - Number of total members (no bots)
\`{server.membercount.bots}\` - Number of total members (bots)
\`{server.rolecount}\` - Number of roles
\`{server.channelcount}\` - Number of channels
\`{server.channelcount.voice}\` - Number of voice channels
\`{server.emojiscount}\` - Number of total emojis
\`{server.emojiscount.animate}\` - Number of animated emojis
\`{server.emojiscount.noanimate}\` - Number of non-animated emojis
\`{server.createdate}\` - Server creation date
\`{server.boostlevel}\` - Boost level of the server
\`{server.boostcount}\` - Number of boosts in the server
\`{server.icon}\` - Link to the server avatar`)
            .addField('Server Owner Information',
                `\`{server.owner}\` - @Mention to the owner (e.j. @Aviii.#0721)
\`{server.owner.id}\` - Owner ID (e.j. 710880777662890095)
\`{server.owner.nick}\` - Owner's nickname, if none, it will show 'No nickname.'
\`{server.owner.avatar}\` - Link to the owner avatar`)
            .addField('Channel Information',
                `\`{channel}\` - Mention to the channel (e.j. #memes)
\`{channel.id}\` - Channel ID (e.j. 773629394894848033)
\`{channel.name}\` - Channel name (e.j. memes)
\`{channel.createdate}\` - Channel creation date`)
            .setFooter(`${this.client.user.username} Variables`)
            .setColor(this.client.color)
            .setTimestamp()
        msg.channel.send(embed)
    }
}