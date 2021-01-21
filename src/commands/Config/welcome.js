const BaseCommand = require('../../Utils/BaseCommand.js')

module.exports = class WelcomeCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'welcome',
            alias: ['setwelcome'],
            category: 'Config',
            memberGuildPermissions: ['ADMINISTRATOR']
        })
    }

    async run(msg, args) {
        if (!args[0]) return msg.channel.send(`Pon una propiedad válida
> welcome channel [#mención]
> welcome message [texto] | <{embed:[embed_name]}>`)
        switch (args[0].toLowerCase()) {
            case 'channel': {
                if (!args[1]) return msg.channel.send('> Dame la id o mención del rol.')
                const matchChannel = args[1] ? args[1].match(/^<#(\d+)>$/) : false
                let canal = matchChannel ? msg.guild.channels.resolve(matchChannel[1]) : msg.guild.channels.resolve(args[1])
                if (!canal || canal.type !== 'text') return msg.channel.send('> No encontré un canal, o el canal mencionado no es de texto.')
                let server = await this.client.db.welcome.findOne({ guildID: msg.guild.id }).exec()
                if (!server) server = new this.client.db.welcome({ guildID: msg.guild.id, channelID: canal.id })
                server.channelID = canal.id
                server.save()
                msg.channel.send(`> El nuevo canal de bienvenidas ahora es ${canal}.`)
                break;
            }
            case 'message': {
                if (!args[1]) return msg.channel.send('> Pon el mensaje de bienvenida.')
                if (/{embed:.+}/gi.test(args[1])) {
                    let embed = args[1].match(/{embed:.+}/gi)[0].split(':')[1].slice(0, -1)
                    if (embed) {
                        let checkear = await this.client.db.embed.findOne({ guildID: msg.guild.id, embed_name: embed }).exec()
                        if (!checkear) return msg.channel.send('> No hay un embed con ese nombre')
                    }
                    let server = await this.client.db.welcome.findOne({ guildID: msg.guild.id }).exec()
                    if (!server) server = new this.client.db.welcome({ guildID: msg.guild.id, embed_name: embed })
                    server.embed_name = embed
                    server.message = ''
                    server.save()
                    msg.channel.send(`> El nuevo embed a usar en las bienvenidas ahora es ${embed}`)
                } else {
                    let [message, embed] = args.slice(1).join(' ').split(' | ').map((m) => m.trim())
                    if (embed) {
                        embed = embed.split(':')[1].slice(0, -1)
                        let checkear = await this.client.db.embed.findOne({ guildID: msg.guild.id, embed_name: embed }).exec()
                        if (!checkear) return msg.channel.send('> No hay un embed con ese nombre')
                    }
                    let server = await this.client.db.welcome.findOne({ guildID: msg.guild.id }).exec()
                    if (!server) server = new this.client.db.welcome({ guildID: msg.guild.id, embed_name: embed ? embed : '', message })
                    server.embed_name = embed ? embed : ''
                    server.message = message
                    server.save()
                    msg.channel.send(`> Se ha actualizado el mensaje ${embed ? 'y embed ' : ''}de bienvenida correctamente`)
                }
                break;
            }
            default: {
                msg.channel.send(`Pon una propiedad valida
> welcome channel [#mencion]
> welcome message [texto] | <{embed:[embed_name]}>`)
                break;
            }
        }
    }
}