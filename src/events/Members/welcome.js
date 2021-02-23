module.exports = class GuildMemberAddEvent {
    constructor(client) {
        this.client = client;
        this.name = 'guildMemberAdd';
    }

    async run(member) {
        const server = await this.client.db.welcome.findOne({ guildID: member.guild.id });
        if (!server) return;
        if (!member.user.bot && server.userRoleID)
            try {
                const rol = member.guild.roles.resolve(server.userRoleID);
                if (rol && rol.editable)
                    member.roles.add(rol.id);
            } catch { }
        if (member.user.bot && server.botRoleID)
            try {
                const rol = member.guild.roles.resolve(server.botRoleID);
                if (rol && rol.editable)
                    member.roles.add(rol.id);
            } catch { }
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