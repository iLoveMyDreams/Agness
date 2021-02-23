module.exports = class MessageEvent {
    constructor(client) {
        this.client = client;
        this.name = 'message';
    }

    async run(msg) {
        if (!msg.author) return;
        let prefix = 'a?';
        if (msg.guild) {
            const modelo = await this.client.db.prefix.findOne({ _id: msg.guild.id });
            prefix = modelo ? modelo.prefix : 'a?';
        }
        const prefixes = [prefix, `<@${this.client.user.id}>`, `<@!${this.client.user.id}>`];
        const usedPrefix = prefixes.find((p) => msg.content.startsWith(p));
        if (!usedPrefix || msg.author.bot) return;
        if (usedPrefix !== prefix)
            msg.mentions.users.delete(msg.mentions.users.first().id);
        const args = msg.content.slice(usedPrefix.length).trim().split(/ +/g);
        const command = args.shift().toLowerCase();
        if (msg.guild && (await this.isTag(msg, this.prefix, command))) return;
        const cmd = this.client.commands.find(c => c.name === command || c.aliases.includes(command));
        try {
            if (!cmd) return;
            cmd.prepare({ serverPrefix: prefix });
            if (!(await cmd.canRun(msg))) return;
            cmd.run(msg, args);
        } catch (e) {
            console.log(e.stack || e);
            msg.channel.send(`An unexpected error has occurred, here is a small reference: ${e.message || e}`);
        }
    }

    async isTag(msg, prefix, name) {
        const tag = await this.client.db.tags.findOne({ guildID: msg.guild.id, name });
        if (!tag) return false;
        const embed_DB = await this.client.db.embed.findOne({ guildID: msg.guild.id, embed_name: tag.embed_name });
        const replaceText = (text) => this.client.replaceText(text, { channel: msg.channel, member: msg.member, prefix });
        const files = tag.image ? [new Discord.MessageAttachment(tag.image, 'image.png')] : null;
        let embed;
        if (embed_DB)
            embed = await this.client.generateEmbed(embed_DB, replaceText);
        tag.addRoleID.forEach((rId) => {
            const role = msg.guild.roles.resolve(rId);
            if (!role) return;
            if (!role.editable) return;
            msg.member.roles.add(role.id);
        });
        tag.deleteRoleID.forEach((rId) => {
            const role = msg.guild.roles.resolve(rId);
            if (!role) return;
            if (!role.editable) return;
            msg.member.roles.remove(role.id);
        });
        if (!tag.message && !embed && !files) return;
        msg.channel.send(await replaceText(tag.message), { embed, files });
        return true;
    }
};