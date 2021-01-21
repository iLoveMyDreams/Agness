module.exports = class MessageEvent {
    constructor(client) {
        this.client = client;
        this.name = 'message';
    }

    async run(msg) {
        let prefix = '.'
        if (msg.guild) {
            const modelo = await this.client.db.prefix.findOne({ _id: msg.guild.id }).exec()
            prefix = modelo ? modelo.prefix : 'a?'
        }
        let prefixes = [prefix, `<@${this.client.user.id}>`, `<@!${this.client.user.id}>`]
        let usedPrefix = prefixes.find((p) => msg.content.startsWith(p))
        if (!usedPrefix || msg.author.bot) return;
        if (usedPrefix !== prefix)
            msg.mentions.users.delete(msg.mentions.users.first().id)
        const args = msg.content.slice(usedPrefix.length).trim().split(/ +/g)
        const command = args.shift().toLowerCase()
        if (await this.handleTag(msg, this.prefix, command)) return;
        const cmd = this.client.commands.find(c => c.name === command || c.alias.includes(command))
        if (!cmd) return;
        cmd.prepare({ serverPrefix: prefix });
        if (cmd.canRun(msg)) return;
        try {
            cmd.run(msg, args)
        } catch (e) {
            console.log(e.message || e)
        } finally {
            console.log(`CMD >> ${msg.author.tag} ejecutó el comando ${cmd.name}`)
        }
    }

    async handleTag(msg, prefix, name) {
        let tag = await this.client.db.tags.findOne({ guildID: msg.guild.id, name }).exec()
        if (!tag) return false
        let embed_DB = await this.client.db.embed.findOne({ guildID: msg.guild.id, embed_name: tag.embed_name }).exec()
        const replaceText = (text) => this.client.replaceText(text, { channel: msg.channel, member: msg.member, prefix })
        let embed = embed_DB ? new Discord.MessageEmbed() : null
        if (embed_DB) {
            if (embed_DB.author_text) {
                embed_DB.author_image ?
                    embed.setAuthor(await replaceText(embed_DB.author_text), await replaceText(embed_DB.author_image)) :
                    embed.setAuthor(await replaceText(embed_DB.author_text))
            }
            if (embed_DB.title) embed.setTitle(await replaceText(embed_DB.title))
            if (embed_DB.description) embed.setDescription(await replaceText(embed_DB.description))
            if (embed_DB.thumbnail) embed.setThumbnail(await replaceText(embed_DB.thumbnail))
            if (embed_DB.image) embed.setImage(await replaceText(embed_DB.image))

            if (embed_DB.footer_text) {
                embed_DB.footer_image ?
                    embed.setFooter(await replaceText(embed_DB.footer_text), await replaceText(embed_DB.footer_image)) :
                    embed.setFooter(await replaceText(embed_DB.footer_text))
            }
            if (embed_DB.timestamp) embed.setTimestamp()
            if (embed_DB) embed.setColor('#' + embed_DB.color)
        }
        tag.addRoleID.forEach((rId) => {
            let role = msg.guild.roles.resolve(rId)
            if (!role) return;
            if(!role.editable) return;
            msg.member.roles.add(role.id)
        })
        tag.deleteRoleID.forEach((rId) => {
            let role = msg.guild.roles.resolve(rId)
            if (!role) return;
            if(!role.editable) return;
            msg.member.roles.remove(role.id)
        })
        if (!tag.message && !embed) return;
        msg.channel.send(await replaceText(tag.message), { embed })
        return true
    }
}