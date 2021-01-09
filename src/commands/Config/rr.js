const BaseCommand = require('../../Utils/BaseCommand.js')
module.exports = class PingCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'rr',
            alias: ['rroles'],
            botGuildPermissions: ['ADMINISTRATOR'],
            memberGuildPermissions: ['ADMINISTRATOR']
        })
    }
    async run(msg, args) {
        if (!args[0] || !args[1]) return msg.channel.send('> Uso correcto: .rr <MESSAGE_ID> <ROL> [ID DEL CANAL]')
        const msgID = args[0]

        const matchRole = args[1].match(/^<@&(\d+)>$/);
        let rol = matchRole[1] ? msg.guild.roles.resolve(matchRole[1]) : msg.guild.roles.resolve(args[1])
        if (!rol) return msg.channel.send('No encontre el rol o no es valido')
        if(!rol.editable) return msg.channel.send('No tengo permisos para dar ese rol')
        const matchChannel = args[2] ? args[2].match(/^<#(\d+)>$/) : false
        let canal = args[2] ? matchChannel ? msg.guild.channels.resolve(matchChannel[1]) : msg.guild.channels.resolve(args[2]) : msg.channel
        if (!canal) return msg.channel.send('No pude encontrar el canal.')
        let mensaje = await canal.messages.fetch(msgID)
        if (!mensaje) return msg.channel.send('Mensaje no encontrado')

        let enviado = await msg.channel.send('Reacciona con el emoji')
        try {
            const filter = (r, u) => u.id === msg.author.id
            let colector = await enviado.awaitReactions(filter, { max: 1, time: 30e3, error: ['time'] })
            let emoji = colector.first().emoji
            enviado.delete()
            if (emoji.id && !this.client.emojis.resolve(emoji.id)) return msg.channel.send('No tengo este emoji en mi cache ;(')
            let emojiID = emoji.id || emoji.name

            let emojiCheck = await this.client.db.reaction.findOne({ messageID: mensaje.id, reaction: emojiID }).exec()
            if (emojiCheck) return msg.channel.send('Ya hay un reactionRol con ese emoji')

            let nuevaDB = new this.client.db.reaction({ guildID: msg.guild.id, messageID: mensaje.id, roleID: rol.id, reaction: emojiID })
            await nuevaDB.save()
            mensaje.react(emoji)

            msg.channel.send(`Ahora se dara el rol ${rol} cuando reaccionen al emoji ${emoji}`)
        } catch (e) {
            enviado.delete()
            msg.channel.send('Se acabo el tiempo ;(')
        }
    }
}