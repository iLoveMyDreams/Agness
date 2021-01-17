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

        if(!args[0]) return msg.channel.send('> Pon una propiedad valida.')
        switch (args[0]) {
            case 'channel':{
                let server = await this.client.db.welcome.findOne({ guildID: msg.guild.id }).exec()
                if(!args[1]) return msg.channel.send('> Dame la id o mencion del rol')
                const matchChannel = args[1] ? args[1].match(/^<#(\d+)>$/) : false
                let canal =  matchChannel ? msg.guild.channels.resolve(matchChannel[1]) : msg.guild.channels.resolve(args[1])
                if(!canal || canal.type !== 'text') return msg.channel.send('> No encontre un canal, o el canal mencionado no es de texto.')
                if (!server) server = new this.client.db.welcome({ guildID: msg.guild.id, channelID: canal.id })
                server.channelID = canal.id
                server.save()
                msg.channel.send(`> El nuevo log de bienvenidas ahora es ${canal}`)
                break;
            }

            case 'message': {
                if(!args[1]) return msg.channel.send('> Pon el mensaje de bienvenida.')
                

                break;
            }
        
            default:
                break;
        }
    }
}