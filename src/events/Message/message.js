module.exports = class MessageEvent {
    constructor(client) {
        this.client = client;
        this.name = 'message';
    }

    async run(msg) {
        let prefix = '.'
        if (msg.guild) {
            const modelo = await this.client.db.prefix.findOne({ _id: msg.guild.id }).exec()
            prefix = modelo ? modelo.prefix : '.'
        }
        let prefixes = [prefix, `<@${this.client.user.id}>`, `<@!${this.client.user.id}>`]
        let usedPrefix = prefixes.find((p) => msg.content.startsWith(p))
        if (!usedPrefix || msg.author.bot) return;
        if (usedPrefix !== prefix)
            msg.mentions.users.delete(msg.mentions.users.first().id)
        const args = msg.content.slice(usedPrefix.length).trim().split(/ +/g)
        const command = args.shift().toLowerCase()
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
}