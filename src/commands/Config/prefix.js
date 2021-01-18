const BaseCommand = require('../../Utils/BaseCommand.js')

module.exports = class PrefixCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'prefix',
            category: 'Config',
            memberGuildPermissions: ['ADMINISTRATOR']
        })
    }

    async run(msg, args) {
        if (!args[0]) return msg.channel.send('> Coloca el nuevo prefijo')
        if (args[0].length > 5) return msg.channel.send('> Coloca un prefijo menor a 5 caracteres')
        let server = await this.client.db.prefix.findOne({ _id: msg.guild.id }).exec()
        if (!server) server = new this.client.db.prefix({ _id: msg.guild.id, prefix: args[0] })
        server.prefix = args[0]
        await server.save()
        msg.channel.send(`> Mi nuevo prefijo es: \`${args[0]}\``)
    }
}