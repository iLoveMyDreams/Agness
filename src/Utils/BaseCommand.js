const devs = process.env.DEVS ? process.env.DEVS.split(', ') : [];

module.exports = class BaseCommand {
    constructor(client, options) {
        this.client = client;
        this.name = options.name;
        this.aliases = options.aliases || [];
        this.category = options.category || 'General';
        this.description = options.description || 'No description.';
        this.usage = options.usage || ((prefix) => `${prefix}${options.name}`);
        this.example = options.example || ((prefix) => `${prefix}${options.name}`);
        this.botGuildPermissions = options.botGuildPermissions || [];
        this.botChannelPermissions = options.botChannelPermissions || [];
        this.memberGuildPermissions = options.memberGuildPermissions || [];
        this.memberChannelPermissions = options.memberChannelPermissions || [];
        this.cooldown = options.cooldown || 2;
        this.enabled = typeof options.enabled === 'boolean' ? options.enabled : true;
        this.guildOnly = typeof options.guildOnly === 'boolean' ? options.guildOnly : this.category !== 'General';
        this.nsfwOnly = typeof options.nsfwOnly === 'boolean' ? options.nsfwOnly : false;
        this.devsOnly = typeof options.devsOnly === 'boolean' ? options.devsOnly : false;
        this.cooldowns = new Discord.Collection();
    }

    prepare({ serverPrefix }) {
        this.prefix = serverPrefix;
    }

    async canRun(msg) {
        if (msg.guild && !msg.channel.permissionsFor(msg.guild.me).has('SEND_MESSAGES')) return false;
        if (this.checkCooldowns(msg)) return !msg.channel.send(`You have to wait **${Number((this.cooldowns.get(msg.author.id) - Date.now()) / 1000).toFixed(2)}s** to execute this command.`);
        const blacklist = await this.client.db.blacklist.findOne({ userID: msg.author.id });
        if (blacklist) return !this.sendEmbed(msg, `You are on the blacklist. Here you have more information:
> **Reason:** \`${blacklist.reason}\`
> **Date:** \`${blacklist.date.toLocaleString()}\`
You can appeal by going to my support server.
> [Support Server](https://discord.gg/K63NqEDm86)`);
        if (!this.enabled && !devs.includes(msg.author.id)) return !this.sendOrReply(msg, 'This command is under maintenance.', { allowedMentions: { users: [] } });
        if (this.guildOnly && !msg.guild) return !this.sendOrReply(msg, 'This command is only available for servers.', { allowedMentions: { users: [] } });
        if (this.devsOnly && !devs.includes(msg.author.id)) return !this.sendOrReply(msg, 'This command can only be used by developers only.', { allowedMentions: { users: [] } });
        if (msg.guild && !msg.channel.nsfw && this.nsfwOnly) return !this.sendOrReply(msg, 'This command can only be used on NSFW channels.', { allowedMentions: { users: [] } });
        if (msg.guild && this.memberGuildPermissions[0] && !this.memberGuildPermissions.some((x) => msg.member.permissions.has(x)) && !devs.includes(msg.author.id))
            return !this.sendOrReply(msg, `You need the following permissions: \`${this.memberGuildPermissions.map(this.parsePermission).join(', ')}\``, { allowedMentions: { users: [] } });
        if (msg.guild && this.memberChannelPermissions[0] && !this.memberChannelPermissions.some((x) => msg.channel.permissionsFor(msg.member).has(x)) && !devs.includes(msg.author.id))
            return !this.sendOrReply(msg, `You need the following permissions on this channel: \`${this.memberChannelPermissions.map(this.parsePermission).join(', ')}\``, { allowedMentions: { users: [] } });
        if (msg.guild && this.botGuildPermissions[0] && !this.botGuildPermissions.some((x) => msg.guild.me.permissions.has(x)))
            return !this.sendOrReply(msg, `I need the following permissions: \`${this.botGuildPermissions.map(this.parsePermission).join(', ')}\``, { allowedMentions: { users: [] } });
        if (msg.guild && this.botChannelPermissions[0] && !this.botChannelPermissions.some((x) => msg.channel.permissionsFor(msg.guild.me).has(x)))
            return !this.sendOrReply(msg, `I need the following permissions on this channel: \`${this.botChannelPermissions.map(this.parsePermission).join(', ')}\``, { allowedMentions: { users: [] } });
        return true;
    }

    checkCooldowns(msg) {
        if (this.cooldowns.has(msg.author.id)) return true;
        this.cooldowns.set(msg.author.id, Date.now() + (this.cooldown * 1000));
        setTimeout(() => {
            this.cooldowns.delete(msg.author.id);
        }, this.cooldown * 1000);
        return false;
    }

    parsePermission(permission) {
        return permission.toLowerCase()
            .replace(/_/g, ' ')
            .replace(/(?:^|\s)\S/g, (c) => c.toUpperCase());
    }

    sendEmbed(msg, text, hexColor) {
        return msg.channel.send(new Discord.MessageEmbed()
            .setDescription(text)
            .setColor(hexColor || this.client.color));
    }

    sendOrReply(msg, ...args) {
        if (msg.guild && !msg.channel.permissionsFor(msg.guild.me).has('READ_MESSAGE_HISTORY'))
            return msg.channel.send(...args);
        return msg.reply(...args);
    }
};