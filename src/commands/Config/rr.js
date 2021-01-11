const BaseCommand = require('../../Utils/BaseCommand.js')
module.exports = class PingCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'rr',
            alias: ['rroles'],
            botGuildPermissions: ['ADMINISTRATOR'],
            memberGuildPermissions: ['ADMINISTRATOR']
        })
        this.types = ['normal', 'unique']
    }
    async run(msg, args) {
        let prefix = '.'
        if (msg.guild) {
            const modelo = await this.client.db.prefix.findOne({ _id: msg.guild.id }).exec()
            prefix = modelo ? modelo.prefix : '.'
        }
        const embed = new Discord.MessageEmbed()
        if (!args[0] || !args[1] || !args[2]) {
            embed.setDescription(`> Uso correcto: ${prefix}rr [@role] [type] [messageID] <#channel>`)
            return msg.channel.send(embed)
        }

        //rol: 0

        const matchRole = args[0].match(/^<@&(\d+)>$/);
        let rol = matchRole[1] ? msg.guild.roles.resolve(matchRole[1]) : msg.guild.roles.resolve(args[0])

        if (!rol) {
            embed.setDescription('> No pude encontrar ese rol o no es valido.')
            return msg.channel.send(embed)
        }
        if (!rol.editable) {
            embed.setDescription('> No tengo los suficientes permisos para dar ese rol.')
            return msg.channel.send(embed)
        }

        //type: 1

        if (
            !this.types.includes(args[1].toLowerCase())
        ) {
            embed.setDescription('> No es un tipo valido de reaction rol.')
                .addField('Tipos:', `Normal => Se puede obtener y quitar el rol con la misma reacción.
Unique => Solo se puede obtener mas no quitar.`)
            return msg.channel.send(embed)
        }

        //mensaje 2
        const msgID = args[2]
        //canal 3

        const matchChannel = args[3] ? args[3].match(/^<#(\d+)>$/) : false
        let canal = args[3] ? matchChannel ? msg.guild.channels.resolve(matchChannel[1]) : msg.guild.channels.resolve(args[3]) : msg.channel

        if (!canal) {
            embed.setDescription('> No pude encontrar el canal o no es valido.')
            return msg.channel.send(embed)
        }
        try {
            var mensaje = await canal.messages.fetch(msgID)
            if (!mensaje) {
                embed.setDescription('> El mensaje no fue encontrado')
                return msg.channel.send(embed)
            }
        } catch (e) {
            embed.setDescription('> Hubo un error al encontrar el mensaje, intenta de nuevo.')
            return msg.channel.send(embed)
        }

        //------//
        embed.setDescription(`Estoy alistando el reaction rol para ${rol}.
Solo falta que reacciones con el emoji con el que quieras que se de el rol.`)
        let enviado = await msg.channel.send(embed)
        try {
            const filter = (r, u) => u.id === msg.author.id
            let colector = await enviado.awaitReactions(filter, { max: 1, time: 30e3, error: ['time'] })
            let emoji = colector.first().emoji

            enviado.delete()

            if (emoji.id && !this.client.emojis.resolve(emoji.id)) {
                embed.setDescription('> No puede encontrar ese emoji en mi cache, intenta poniendo el emoji en el servidor.')
                return msg.channel.send(embed)
            }
            let emojiID = emoji.id || emoji.name

            let emojiCheck = await this.client.db.reaction.findOne({ messageID: mensaje.id, reaction: emojiID }).exec()
            if (emojiCheck) {
                embed.setDescription('> Ya hay un reaction rol con ese emoji.')
                return msg.channel.send(embed)
            }

            let nuevaDB = new this.client.db.reaction({ guildID: msg.guild.id, messageID: mensaje.id, roleID: rol.id, reaction: emojiID, type: args[1].toLowerCase() })
            await nuevaDB.save()

            mensaje.react(emoji)

            embed.setDescription(`Ahora se dara el rol ${rol} cuando reaccionen al emoji: ${emoji}`)
            msg.channel.send(embed)
        } catch (e) {
            enviado.delete()
            msg.channel.send('> Se acabo el tiempo ;(')
        }
    }
}