module.exports = class GuildMemberAddEvent {
    constructor(client) {
        this.client = client;
        this.name = 'guildMemberAdd';
    }

    async run(member) {
        let server = await this.client.db.welcome.findOne({ guildID: member.guild.id }).exec()
        if (!server) return;
        let channel = member.guild.channels.resolve(server.channelID)
        if (!channel) return;

        if (!member.user.bot && server.userRoleID) {
            let rol = member.guild.roles.resolve(server.userRoleID)
            if (!rol) return;
            if (!rol.editable) return;
            member.roles.add(rol.id).catch(() => { })
        }
        if (member.user.bot && server.botRoleID) {
            let rol = member.guild.roles.resolve(server.botRoleID)
            if (!rol) return;
            if (!rol.editable) return;
            member.roles.add(rol.id).catch(() => { })
        }
        let embed;
        let embed_DB = await this.client.db.embed.findOne({ guildID: member.guild.id, embed_name: server.embed_name }).exec()
        let prefix = 'a?'
        let modelo = await this.client.db.prefix.findOne({ _id: member.guild.id }).exec()
        prefix = modelo ? modelo.prefix : 'a?'
        const replaceText = (text) => this.client.replaceText(text, { channel, member, prefix: 'a' })
        if (embed_DB)
            embed = await this.client.generateEmbed(embed_DB, replaceText);
        if (!server.message && !embed) return;
        channel.send(await replaceText(server.message), { embed }).catch(() => { })
    }
}