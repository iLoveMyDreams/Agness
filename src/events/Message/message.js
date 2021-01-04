const { model } = require("mongoose");

module.exports = class MessageEvent {
    constructor(client) {
        this.client = client;
        this.name = 'message';
    }
    async run(msg) {
        let prefix = '.'
        if (msg.guild) {
            const modelo = await this.client.db.prefix.findOne({ _id: msg.guild.id}).exec()
            prefix = modelo ? modelo.prefix : '.'
        }
        if (!msg.content.startsWith(prefix) || msg.author.bot) return;
        const args = msg.content.slice(prefix.length).trim().split(/ +/g)
        const command = args.shift().toLowerCase()
        const cmd = this.client.commands.find(c => c.name === command || c.alias.includes(command))
        if (!cmd) return;
        if (cmd.canRun(msg)) return;
        try {
            cmd.run(msg, args)
        } catch (e) {
            console.log(e.message || e)
        }
    }
}