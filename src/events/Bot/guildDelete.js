module.exports = class GuildDeleteEvent {
    constructor(client) {
        this.client = client;
        this.name = 'guildDelete';
    }

    async run(guild) {
        await this.client.db.prefix.findOneAndDelete({ _id: guild.id })
        await this.client.db.welcome.findOneAndDelete({ guildID: guild.id })
        await this.client.db.leave.findOneAndDelete({ guildID: guild.id })
        await this.client.db.reaction.deleteMany({ guildID: guild.id })
        await this.client.db.embed.deleteMany({ guildID: guild.id })
        await this.client.db.tags.deleteMany({ guildID: guild.id })
        
        const guilds = (await this.client.shard.fetchClientValues('guilds.cache.size')).reduce((acc, guildCount) => acc + guildCount, 0);
        const canal = await this.client.channels.fetch(process.env.SERVERS_CHANNEL);
        const owner = await this.client.users.fetch(guild.ownerID);
        if (canal)
            canal.send(new Discord.MessageEmbed()
                .setAuthor('Server Remove', this.client.user.displayAvatarURL({ dynamic: true }))
                .setDescription(`**Name**: ${guild.name}\n**Members**: ${guild.memberCount}\n**Owner**: ${owner.tag} | ${owner.id}`)
                .setThumbnail(guild.iconURL({ dynamic: true }))
                .setColor('RED')
                .setFooter(`Servers count: ${guilds}`)
                .setTimestamp());
    }
};