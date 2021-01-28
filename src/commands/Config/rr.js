const BaseCommand = require('../../Utils/BaseCommand.js')

module.exports = class ReactionRoleCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'rrole',
            alias: ['rroles', 'rr'],
            description: 'Puedes poner roles por reacciones en el mensaje que quieras, roles de colores, roles para pings, todo es posible!',
            usage: (prefix) => `${prefix}rrole [@role] [type] [messageID] <#channel>`,
            example: (prefix) => `${prefix}rrole @Guapo normal 12345`,
            botGuildPermissions: ['MANAGE_ROLES'],
            memberGuildPermissions: ['ADMINISTRATOR'],
            category: 'Config'
        })
        this.types = ['normal', 'unique', 'only']
        this.emojiUnicode = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g
        this.emojiDiscord = /<a?:[a-z]{3,32}:\d{16,19}>/gi
    }

    async run(msg, args) {
        const embed = new Discord.MessageEmbed()
            .setColor('#FDB2A2')
        if (!args[0]) {
            embed.setDescription(`> Uso correcto: ${this.prefix}rrole [@role] [type] [messageID] <#channel>`)
            return msg.channel.send(embed)
        }
        if (args[0].toLowerCase() === 'types') {
            embed.addField('Tipos:', `Normal => Se puede obtener y quitar el rol con la misma reacción.
Unique => Solo se puede obtener, mas no quitar.
Only => Solo se podrá obtener un reaction rol del mismo tipo en el mensaje.`)
            return msg.channel.send(embed)
        } else if (args[0].toLowerCase() === 'delete') {
            if (!args[1] || !args[2]) {
                embed.setDescription(`> Uso correcto: ${this.prefix}rrole delete [emoji] [messageID]`)
                return msg.channel.send(embed)
            }
            if (!this.emojiUnicode.test(args[1]) || !this.emojiDiscord.test(args[1])) {
                embed.setDescription('> Debes poner un emoji.')
                return msg.channel.send(embed)
            }
            let emojiID = this.emojiDiscord.test(args[1]) ? args[1].split(':')[1] : args[1]
            let emojiCheck = await this.client.db.reaction.findOneAndDelete({ guildID: msg.guild.id, messageID: args[2], reaction: emojiID }).exec()
            if (!emojiCheck) {
                embed.setDescription('> No se pudo eliminar el reactionrol, comprueba si ya existe uno con esa ID de mensaje y emoji dentro del servidor.')
                return msg.channel.send(embed)
            }
            embed.setDescription('> Reactionrol eliminado correctamente.')
            return msg.channel.send(embed)
        }
        if (!args[1] || !args[2]) {
            embed.setDescription(`> Uso correcto: ${this.prefix}rrole [@role] [type] [messageID] <#channel>`)
            return msg.channel.send(embed)
        }
        //rol: 0

        const matchRole = args[0].match(/^<@&(\d+)>$/);
        let rol = matchRole ? msg.guild.roles.resolve(matchRole[1]) : msg.guild.roles.resolve(args[0])

        if (!rol) {
            embed.setDescription('> No pude encontrar ese rol o no es válido.')
            return msg.channel.send(embed)
        }
        if (!rol.editable) {
            embed.setDescription('> No tengo los suficientes permisos para dar ese rol.')
            return msg.channel.send(embed)
        }

        //type: 1

        if (!this.types.includes(args[1].toLowerCase())) {
            embed.setDescription('> No es un tipo valido de reaction rol.')
                .addField('Tipos:', `Normal => Se puede obtener y quitar el rol con la misma reacción.
Unique => Solo se puede obtener, mas no quitar.
Only => Solo se podrá obtener un reaction rol del mismo tipo en el mensaje.`)
            return msg.channel.send(embed)
        }

        //mensaje 2
        const msgID = args[2]
        //canal 3

        const matchChannel = args[3] ? args[3].match(/^<#(\d+)>$/) : false
        let canal = args[3] ? matchChannel ? msg.guild.channels.resolve(matchChannel[1]) : msg.guild.channels.resolve(args[3]) : msg.channel

        if (!canal) {
            embed.setDescription('> No pude encontrar el canal o no es válido.')
            return msg.channel.send(embed)
        }
        if (!canal.viewable) {
            embed.setDescription('> No tengo permisos para ver ese canal.')
            return msg.channel.send(embed)
        }
        try {
            var mensaje = await canal.messages.fetch(msgID)
            if (!mensaje) {
                embed.setDescription('> El mensaje no fue encontrado.')
                return msg.channel.send(embed)
            }
        } catch (e) {
            embed.setDescription('> Hubo un error al encontrar el mensaje, intenta de nuevo.')
            return msg.channel.send(embed)
        }

        //------//
        embed.setDescription(`Estoy alistando el reaction rol para ${rol}.
Solo falta que reacciones con el emoji con el que quieras que se dé el rol.`)
        let enviado = await msg.channel.send(embed)
        try {
            const filter = (r, u) => u.id === msg.author.id
            let colector = await enviado.awaitReactions(filter, { max: 1, time: 30e3, error: ['time'] })
            let emoji = colector.first().emoji

            enviado.delete()

            if (emoji.id && !this.client.emojis.resolve(emoji.id)) {
                embed.setDescription('> No puede encontrar ese emoji en mi caché, intenta poniendo el emoji en el servidor.')
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

            embed.setDescription(`Ahora se dará el rol ${rol} cuando reaccionen al emoji: ${emoji}`)
            msg.channel.send(embed)
        } catch (e) {
            enviado.delete()
            msg.channel.send('> Se acabó el tiempo ;(')
        }
    }
}