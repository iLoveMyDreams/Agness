const BaseCommand = require('../../Utils/BaseCommand.js');

module.exports = class GuildsCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'guilds',
            aliases: ['servers'],
            botChannelPermissions: ['EMBED_LINKS']
        });
    }

    async run(msg) {
        const results = await Promise.all([
            this.client.shard.fetchClientValues('guilds.cache.size'),
            this.client.shard.broadcastEval('this.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)')
        ]);
        const totalGuilds = results[0].reduce((acc, guildCount) => acc + guildCount, 0);
        const totalMembers = results[1].reduce((acc, memberCount) => acc + memberCount, 0);
        return msg.channel.send(new Discord.MessageEmbed()
            .setDescription(`At this moment, I'm in **${totalGuilds}** servers and with **${totalMembers}** cached users.`)
            .setFooter(`This server is on the shard ${this.client.shard.ids.map((i) => `${i}`).join(', ')}`)
            .setColor(this.client.color));
    }
};