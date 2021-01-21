const BaseCommand = require('../../Utils/BaseCommand.js')

module.exports = class VariablesCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'variables',
        })
    }

    async run(msg, args) {
        const embed = new Discord.MessageEmbed()
                    .setTitle(`Variables de Asuna.`)
                    .setDescription(
                        `Estas variables pueden ser usadas editando embeds y en los mensajes de bienvenida/despedida.`
                    )
                    .setColor('#fab1d7')
                    .addField(
                        `Información del Usuario`,
                        `\`{user}\` - @mencion (e.j. @Aviii.#0721)
\`{user.name}\` - nombre de usuario (e.j. Aviii.)
\`{user.discrim}\` - tag del usuario (e.j. 0721)
\`{user.nick}\` - apodo del miembro, si no tiene devolvera "No tiene apodo."
\`{user.createdate}\` - fecha de creación de la cuenta
\`{user.joindate}\` - fecha en la que se unió al servidor
\`{user.id}\` - ID del usuario (e.j. 710880777662890095)
\`{user.avatar}\` - link de la foto de perfil`
                    )
                    .addField(
                        `Información del Servidor`,
                        `\`{server}\` - nombre del servidor (e.j. Asuna's Support)
\`{server.prefix}\` - prefijo del servidor (por defecto: a?)
\`{server.id}\` - ID del servidor (e.j. 773629394894848030)
\`{server.membercount}\` - número de miembros en total
\`{server.membercount.nobots}\` - número de miembros no bots
\`{server.membercount.nobots}\` - número de miembros bots
\`{server.rolecount}\` - número roles
\`{server.channelcount}\` - número canales en total
\`{server.channelcount.voice}\` - número canales de voz
\`{server.emojiscount}\` - número de emojis en total
\`{server.emojiscount.animate}\` - número de emojis animados
\`{server.emojiscount.noanimate}\` - número de emojis no animados
\`{server.createdate}\` - fecha de creación del servidor
\`{server.boostlevel}\` - nivel del servidor
\`{server.boostcount}\` - cantidad de boosts del servidor
\`{server.icon}\` - link de la foto del servidor`
                    )
                    .addField(
                        `Información del Owner/del servidor`,
                        `\`{server.owner}\` - mención al owner (e.j. @Aviii.#0721)
\`{server.owner.id}\` - ID del owner (e.j. 710880777662890095)
\`{server.owner.nick}\` - apodo del owner, si no tiene devolvera "No tiene apodo."
\`{server.owne.avatar}\` - link de la foto de perfil`
                    )
                    .addField(
                        `Información de un Canal`,
                        `\`{channel}\` - mención del canal (e.j. #memes)
\`{channel.id}\` - ID del canal (e.j. 773629394894848033)
\`{channel.name}\` - nombre del canal (e.j. memes)
\`{channel.createdate}\` - fecha de creacion del canal`
                    )
                    .setFooter(`Asuna variables`)
                    .setTimestamp()
                msg.channel.send(embed)
    }
}