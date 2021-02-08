module.exports = class GuildCreateEvent {
    constructor(client) {
        this.client = client;
        this.name = 'guildCreate';
    }

    async run(guild) {
        const guilds = (await this.client.shard.fetchClientValues('guilds.cache.size')).reduce((acc, guildCount) => acc + guildCount, 0);
        const canal = await this.client.channels.fetch(process.env.SERVERS_CHANNEL);
        if (canal)
            canal.send(new Discord.MessageEmbed()
                .setAuthor('New server', this.client.user.displayAvatarURL())
                .setDescription(`**Name**: ${guild.name}\n**Members**: ${guild.memberCount}\n**Owner**: ${guild.owner ? guild.owner.user.tag : guild.ownerID}`)
                .setThumbnail(guild.iconURL())
                .setColor(this.client.color)
                .setFooter(`Servers count: ${guilds}`)
                .setTimestamp());
    }
};