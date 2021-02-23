const BaseCommand = require('../../Utils/BaseCommand.js');

module.exports = class AvatarCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'avatar',
            aliases: ['av', 'pfp', 'foto'],
            botChannelPermissions: ['EMBED_LINKS']
        });
    }

    async run(msg, args) {
        let user = msg.mentions.users.first() ||
            this.client.users.cache.get(args[0]) ||
            this.client.users.cache.find(e => (e.username == args.join(' ')) || (e.tag == args.join(' '))) ||
            (msg.guild ? (msg.guild.members.cache.find(e => (e.nickname === args.join(' ')))) : undefined) ||
            (args[0] ? await this.client.users.fetch(args[0]).catch(() => { }) : undefined) || msg.author;
        if (user instanceof Discord.GuildMember)
            user = user.user;
        const extension = (user.avatar || '').startsWith('a_') ? 'gif' : 'png';
        const avatar = user.displayAvatarURL({ format: extension, size: 4096 });
        return msg.channel.send(new Discord.MessageEmbed()
            .setColor(this.client.color)
            .setDescription(`**${user.username}**'s avatar
> [Avatar link](${avatar})`)
            .attachFiles([new Discord.MessageAttachment(avatar, `avatar.${extension}`)])
            .setImage(`attachment://avatar.${extension}`));
    }
};