module.exports = class GuildMemberRemoveEvent {
    constructor(client) {
        this.client = client;
        this.name = 'guildMemberRemove';
    }

    async run(member) {
        const server = await this.client.db.leave.findOne({ guildID: member.guild.id });
        if (!server) return;
        const channel = member.guild.channels.resolve(server.channelID);
        if (!channel) return;

        let embed;
        const embed_DB = await this.client.db.embed.findOne({ guildID: member.guild.id, embed_name: server.embed_name });
        let prefix = 'a?';
        const modelo = await this.client.db.prefix.findOne({ _id: member.guild.id });
        prefix = modelo ? modelo.prefix : 'a?';
        const replaceText = (text) => this.client.replaceText(text, { channel, member, prefix });
        if (embed_DB)
            embed = await this.client.generateEmbed(embed_DB, replaceText);
        if (!server.message && !embed) return;
        try {
            channel.send(await replaceText(server.message), { embed });
        } catch { }
    }
};