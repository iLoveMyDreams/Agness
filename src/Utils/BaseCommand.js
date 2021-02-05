const devs = process.env.DEVS ? process.env.DEVS.split(', ') : [];

module.exports = class BaseCommand {
    constructor(client, options) {
        this.client = client
        this.name = options.name
        this.alias = options.alias || []
        this.category = options.category || 'General'
        this.description = options.description || 'No description.'
        this.usage = options.usage || ((prefix) => `${prefix}${options.name}`)
        this.example = options.example || ((prefix) => `${prefix}${options.name}`)
        this.botGuildPermissions = options.botGuildPermissions || []
        this.botChannelPermissions = options.botChannelPermissions || []
        this.memberGuildPermissions = options.memberGuildPermissions || []
        this.memberChannelPermissions = options.memberChannelPermissions || []
        this.cooldown = options.cooldown || 2
        this.enabled = options.enabled || true
        this.guildOnly = options.guildOnly || true
        this.nsfwOnly = options.nsfwOnly || false
        this.devsOnly = options.devsOnly || false
        this.cooldowns = new Discord.Collection()
    }

    prepare({ serverPrefix }) {
        this.prefix = serverPrefix;
    }

    canRun(msg) {
        if (msg.guild && !msg.channel.permissionsFor(msg.guild.me).has('SEND_MESSAGES')) return false;
        if (this.checkCooldowns(msg)) return !!msg.channel.send(`You have to wait **${Number((this.cooldowns.get(msg.author.id) - Date.now()) / 1000).toFixed(2)}s** to execute this command.`)
        if (!this.enabled && !devs.includes(msg.author.id)) return !msg.reply('This command is under maintenance.', { allowedMentions: { users: [] } });
        if (this.guildOnly && !msg.guild) return !!msg.reply('This command is only available for servers.', { allowedMentions: { users: [] } });
        if (this.devsOnly && !devs.includes(msg.author.id)) return !msg.reply('This command can only be used by developers only.', { allowedMentions: { users: [] } });
        if (msg.guild && !msg.channel.nsfw && this.nsfwOnly) return !msg.reply('This command can only be used on NSFW channels.', { allowedMentions: { users: [] } });
        if (msg.guild && this.memberGuildPermissions[0] && !this.memberGuildPermissions.some((x) => msg.member.permissions.has(x)) && !devs.includes(msg.author.id))
            return !msg.reply(`You need the following permissions: \`${this.memberGuildPermissions.map(this.parsePermission).join(', ')}\``, { allowedMentions: { users: [] } });
        if (msg.guild && this.memberChannelPermissions[0] && !this.memberChannelPermissions.some((x) => msg.channel.permissionsFor(msg.member).has(x)) && !devs.includes(msg.author.id))
            return !msg.reply(`You need the following permissions on this channel: \`${this.memberChannelPermissions.map(this.parsePermission).join(', ')}\``, { allowedMentions: { users: [] } });
        if (msg.guild && this.botGuildPermissions[0] && !this.botGuildPermissions.some((x) => msg.guild.me.permissions.has(x)))
            return !msg.reply(`I need the following permissions: \`${this.botGuildPermissions.map(this.parsePermission).join(', ')}\``, { allowedMentions: { users: [] } });
        if (msg.guild && this.botChannelPermissions[0] && !this.botChannelPermissions.some((x) => msg.channel.permissionsFor(msg.guild.me).has(x)))
            return !msg.reply(`I need the following permissions on this channel: \`${this.botChannelPermissions.map(this.parsePermission).join(', ')}\``, { allowedMentions: { users: [] } });
        return true;
    }

    checkCooldowns(msg) {
        if (this.cooldowns.has(msg.author.id)) return true;
        this.cooldowns.set(msg.author.id, Date.now() + (this.cooldown * 1000))
        setTimeout(() => {
            this.cooldowns.delete(msg.author.id)
        }, this.cooldown * 1000);
        return false;
    }

    parsePermission(permission) {
        return permission.toLowerCase()
            .replace(/_/g, ' ')
            .replace(/(?:^|\s)\S/g, (c) => c.toUpperCase());
    }
		sendEmbed(msg, text, hexColor) {
			let embedRespuesta = new Discord.MessageEmbed()
				.setDescription(text)
				.setColor(hexColor || this.client.color)
			return msg.channel.send(embedRespuesta)
    }
}