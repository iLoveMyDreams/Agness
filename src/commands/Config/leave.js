const BaseCommand = require('../../Utils/BaseCommand.js')

module.exports = class LeaveCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'leave',
            alias: ['setleave'],
            category: 'Config',
            memberGuildPermissions: ['ADMINISTRATOR']
        })
    }

    async run(msg, args) {
        if (!args[0]) return msg.channel.send('> Pon una propiedad válida.')
        switch (args[0].toLowerCase()) {
            case 'channel': {
                if (!args[1]) return msg.channel.send('> Dame la id o mención del rol.')
                const matchChannel = args[1] ? args[1].match(/^<#(\d+)>$/) : false
                let canal = matchChannel ? msg.guild.channels.resolve(matchChannel[1]) : msg.guild.channels.resolve(args[1])
                if (!canal || canal.type !== 'text') return msg.channel.send('> No encontré un canal, o el canal mencionado no es de texto.')
                let server = await this.client.db.leave.findOne({ guildID: msg.guild.id }).exec()
                if (!server) server = new this.client.db.leave({ guildID: msg.guild.id, channelID: canal.id })
                server.channelID = canal.id
                server.save()
                msg.channel.send(`> El nuevo canal de salidas ahora es ${canal}.`)
                break;
            }
            case 'message': {
                if (!args[1]) return msg.channel.send('> Pon el mensaje de salida.')
                if (/{embed:[a-z\d]+}/gi.test(args[1])) {
                    let embed = args[1].split(':')[1].slice(0, -1)
                    if (embed) {
                        let checkear = await this.client.db.embed.findOne({ guildID: msg.guild.id, embed_name: embed }).exec()
                        if (!checkear) return msg.channel.send('> No hay un embed con ese nombre')
                    }
                    let server = await this.client.db.leave.findOne({ guildID: msg.guild.id }).exec()
                    if (!server) server = new this.client.db.leave({ guildID: msg.guild.id, embed_name: embed })
                    server.embed_name = embed
                    server.save()
                    msg.channel.send(`> El nuevo embed a usar en las salidas ahora es ${embed}`)
                } else {
                    let [message, embed] = args.slice(1).join(' ').split(' | ').map((m) => m.trim())
                    if (embed) {
                        embed = embed.split(':')[1].slice(0, -1)
                        let checkear = await this.client.db.embed.findOne({ guildID: msg.guild.id, embed_name: embed }).exec()
                        if (!checkear) return msg.channel.send('> No hay un embed con ese nombre')
                    }
                    let server = await this.client.db.leave.findOne({ guildID: msg.guild.id }).exec()
                    if (!server) server = new this.client.db.leave({ guildID: msg.guild.id, embed_name: embed ? embed : '', message })
                    server.embed_name = embed ? embed : ''
                    server.message = message
                    server.save()
                    msg.channel.send(`> Se ha actualizado el mensaje ${embed ? 'y embed ' : ''}de salida correctamente`)
                }
                break;
            }
            default:
                break;
        }
    }
}