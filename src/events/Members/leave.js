module.exports = class GuildMemberRemoveEvent {
    constructor(client) {
        this.client = client;
        this.name = 'guildMemberRemove';
    }

    async run(member) {
        let server = await this.client.db.leave.findOne({ guildID: member.guild.id }).exec();
        if (!server) return;
        let channel = member.guild.channels.resolve(server.channelID);
        if (!channel) return;
        let embed;
        let embed_DB = await this.client.db.embed.findOne({ guildID: member.guild.id, embed_name: server.embed_name }).exec();
        let prefix = 'a?';
        let modelo = await this.client.db.prefix.findOne({ _id: member.guild.id }).exec();
        prefix = modelo ? modelo.prefix : 'a?';
        const replaceText = (text) => this.client.replaceText(text, { channel, member, prefix });
        if (embed_DB)
            embed = await this.client.generateEmbed(embed_DB, replaceText);
        if (!server.message && !embed) return;
        channel.send(await replaceText(server.message), { embed }).catch(() => { });
    }
};