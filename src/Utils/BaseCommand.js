const devs = process.env.DEVS ? process.env.DEVS.split(', ') : [];

module.exports = class BaseCommand {
    constructor(client, options) {
        this.client = client
        this.name = options.name
        this.alias = options.alias || []
        this.category = options.category || 'General'
        this.description = options.description || 'No tiene descripción'
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
        if (this.checkCooldowns(msg)) return msg.channel.send(`Tienes que esperar ${Number((this.cooldowns.get(msg.author.id) - Date.now()) / 1000).toFixed(2)}s para ejecutar el comando.`)
        if (!this.enabled && !devs.includes(msg.author.id)) return msg.reply('Este comando se encuentra en mantenimiento ;(');
        if (this.guildOnly && !msg.guild) return msg.reply('Este comando solo puede ser utilizado en servidores.');
        if (this.devsOnly && !devs.includes(msg.author.id)) return msg.reply('Este comando solo puede ser usado únicamente por desarrolladores.');
        if (msg.guild && !msg.channel.nsfw && this.nsfwOnly) return msg.reply('Este comando solo se puede utilizar en canales NSFW.')
        if(msg.guild && !['SEND_MESSAGES'].some((x) => msg.channel.permissionsFor(msg.guild.me).has(x))) return;
        if (msg.guild && this.botGuildPermissions[0] && !this.botGuildPermissions.some((x) => msg.guild.me.hasPermission(x))) {
            return msg.reply(`No tengo los suficientes permisos: \`${this.botGuildPermissions.join(', ')}\``);
        }
        if (msg.guild && this.botChannelPermissions[0] && !this.botChannelPermissions.some((x) => msg.channel.permissionsFor(msg.guild.me).has(x))) {
            return msg.reply(`No tengo los suficientes permisos en este canal: \`${this.botChannelPermissions.join(', ')}\``);
        }
        if (msg.guild && this.memberGuildPermissions[0] && !this.memberGuildPermissions.some((x) => msg.member.hasPermission(x)) && !devs.includes(msg.author.id)) {
            return msg.reply(`No tienes los suficientes permisos: \`${this.memberGuildPermissions.join(', ')}\``);
        }
        if (msg.guild && this.memberChannelPermissions[0] && !this.memberChannelPermissions.some((x) => msg.channel.permissionsFor(msg.member).has(x)) && !devs.includes(msg.author.id)) {
            return msg.reply(`No tienes los suficientes permisos en este canal: \`${this.memberChannelPermissions.join(', ')}\``);
        }
        return false
    }

    checkCooldowns(msg) {
        if (this.cooldowns.has(msg.author.id)) return true;
        this.cooldowns.set(msg.author.id, Date.now() + (this.cooldown * 1000))
        setTimeout(() => {
            this.cooldowns.delete(msg.author.id)
        }, this.cooldown * 1000);
        return false;
    }
}