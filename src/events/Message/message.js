module.exports = class MessageEvent {
    constructor(client) {
        this.client = client;
        this.name = 'message';
    }

    async run(msg) {
        let prefix = 'a?';
        if (msg.guild) {
            const modelo = await this.client.db.prefix.findOne({ _id: msg.guild.id }).exec();
            prefix = modelo ? modelo.prefix : 'a?';
        }
        let prefixes = [prefix, `<@${this.client.user.id}>`, `<@!${this.client.user.id}>`];
        let usedPrefix = prefixes.find((p) => msg.content.startsWith(p));
        if (!usedPrefix || msg.author.bot) return;
        if (usedPrefix !== prefix)
            msg.mentions.users.delete(msg.mentions.users.first().id);
        const args = msg.content.slice(usedPrefix.length).trim().split(/ +/g);
        const command = args.shift().toLowerCase();
        if (await this.isTag(msg, this.prefix, command)) return;
        const cmd = this.client.commands.find(c => c.name === command || c.alias.includes(command));
        if (!cmd) return;
        try {
            cmd.prepare({ serverPrefix: prefix });
            if (!(await cmd.canRun(msg))) return;
            cmd.run(msg, args);
        } catch (e) {
            console.log(e.message || e);
            msg.channel.send(`An unexpected error has occurred, here is a small reference: ${e.message || e}`);
        } finally {
            console.log(`CMD >> ${msg.author.tag} ejecutó el comando ${cmd.name}`);
        }
    }

    async isTag(msg, prefix, name) {
        let tag = await this.client.db.tags.findOne({ guildID: msg.guild.id, name }).exec();
        if (!tag) return false;
        let embed_DB = await this.client.db.embed.findOne({ guildID: msg.guild.id, embed_name: tag.embed_name }).exec();
        const replaceText = (text) => this.client.replaceText(text, { channel: msg.channel, member: msg.member, prefix });
        let files = tag.image ? [new Discord.MessageAttachment(tag.image, 'image.png')] : null;
        let embed;
        if (embed_DB)
            embed = await this.client.generateEmbed(embed_DB, replaceText);
        tag.addRoleID.forEach((rId) => {
            let role = msg.guild.roles.resolve(rId);
            if (!role) return;
            if (!role.editable) return;
            msg.member.roles.add(role.id);
        });
        tag.deleteRoleID.forEach((rId) => {
            let role = msg.guild.roles.resolve(rId);
            if (!role) return;
            if (!role.editable) return;
            msg.member.roles.remove(role.id);
        });
        if (!tag.message && !embed && !files) return;
        msg.channel.send(await replaceText(tag.message), { embed, files });
        return true;
    }
};