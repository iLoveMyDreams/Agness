module.exports = class GuildCreateEvent {
    constructor(client) {
        this.client = client;
        this.name = 'guildCreate';
    }

    async run(guild) {
        const guilds = (await this.client.shard.fetchClientValues('guilds.cache.size')).reduce((acc, guildCount) => acc + guildCount, 0);
        const canal = await this.client.channels.fetch(process.env.SERVERS_CHANNEL);
        const owner = await this.client.users.fetch(guild.ownerID);
        if (canal)
            canal.send(new Discord.MessageEmbed()
                .setAuthor('New Server', this.client.user.displayAvatarURL({ dynamic: true }))
                .setDescription(`**Name**: ${guild.name}\n**Members**: ${guild.memberCount}\n**Owner**: ${owner.tag} | ${owner.id}`)
                .setThumbnail(guild.iconURL({ dynamic: true }))
                .setColor(this.client.color)
                .setFooter(`Servers count: ${guilds}`)
                .setTimestamp());
    }
};