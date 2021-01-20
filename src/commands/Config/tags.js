const BaseCommand = require('../../Utils/BaseCommand.js')

module.exports = class TagsCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'tags',
            alias: ['tag'],
            botGuildPermissions: ['MANAGE_ROLES'],
            memberGuildPermissions: ['ADMINISTRATOR'],
            category: 'Config'
        })
    }

    async run(msg, args) {
        if (!args[0]) return msg.channel.send(`Pon una propiedad válida
> tags add [nombre] <{message:[texto]}> <{embed:[embed_name]}> <{addrole:[id1]:<id2>}> <{removerole:[id1]:<id2>}>
> tags edit [nombre] <{message:[texto]}> <{embed:[embed_name]}> <{addrole:[id1]:<id2>}> <{removerole:[id1]:<id2>}>
> tags delete [nombre]`)
        switch (args[0].toLowerCase()) {
            case 'add': {
                if (!args[1]) return msg.channel.send('Pon un nombre válido')
                if (this.client.commands.find(c => c.name === args[1].toLowerCase() || c.alias.includes(args[1].toLowerCase()))) return message.channel.send('No puedes crear un tag con el nombre de un comando')
                let tag = await this.client.db.tags.findOne({ guildID: msg.guild.id, name: args[1].toLowerCase() }).exec()
                if (tag) return msg.channel.send('Ya existe un tag con ese nombre')
                let message = args.slice(2).join(' ').match(/{message:(.|\d)+}/gi) ? args.slice(2).join(' ').match(/{message:(.|\d)+}/gi)[0].split(':')[1].slice(0, -1) : ''
                let embed_name = args.slice(2).join(' ').match(/{embed:(.|\d)+}/gi) ? args.slice(2).join(' ').match(/{embed:(.|\d)+}/gi)[0].split(':')[1].slice(0, -1) : ''
                let addRoleID = args.slice(2).join(' ').match(/{addrole(:(.|\d)+}){1,2}/gi) ? args.slice(2).join(' ').match(/{addrole(:(.|\d)+}){1,2}/gi)[0].split(':').slice(1).map((r) => msg.guild.roles.resolve(r)).filter((r) => r !== null) : []
                let deleteRoleID = args.slice(2).join(' ').match(/{removerole(:(.|\d)+}){1,2}/gi) ? args.slice(2).join(' ').match(/{removerole(:(.|\d)+}){1,2}/gi)[0].split(':').slice(1).map((r) => msg.guild.roles.resolve(r)).filter((r) => r !== null) : []
                if (!message && !embed_name) return msg.channel.send('Debes poner un mensaje o embed para enviar o los dos')
                if (embed_name) {
                    let checkear = await this.client.db.embed.findOne({ guildID: msg.guild.id, embed_name }).exec()
                    if (!checkear) return msg.channel.send('No hay un embed con ese nombre')
                }
                if (addRoleID.some(r => !r.editable)) return msg.channel.send('No puedo dar ese rol.')
                if (deleteRoleID.some(r => !r.editable)) return msg.channel.send('No puedo quitar ese rol')
                tag = new this.client.db.tags({
                    guildID: msg.guild.id,
                    name: args[1].toLowerCase(),
                    deleteRoleID,
                    embed_name,
                    addRoleID,
                    message
                })
                tag.save()
                msg.channel.send(`Tag con el nombre **${args[1].toLowerCase()}** creado correctamente`)
                break;
            }
            case 'edit': {
                if (!args[1]) return msg.channel.send('Pon un nombre válido')
                let tag = await this.client.db.tags.findOne({ guildID: msg.guild.id, name: args[1].toLowerCase() }).exec()
                if (!tag) return msg.channel.send('No existe un tag con ese nombre')
                let message = args.slice(2).join(' ').match(/{message:(.|\d)+}/gi) ? args.slice(2).join(' ').match(/{message:(.|\d)+}/gi)[0].split(':')[1].slice(0, -1) : ''
                let embed_name = args.slice(2).join(' ').match(/{embed:(.|\d)+}/gi) ? args.slice(2).join(' ').match(/{embed:(.|\d)+}/gi)[0].split(':')[1].slice(0, -1) : ''
                let addRoleID = args.slice(2).join(' ').match(/{addrole(:(.|\d)+}){1,2}/gi) ? args.slice(2).join(' ').match(/{addrole(:(.|\d)+}){1,2}/gi)[0].split(':').slice(1).map((r) => msg.guild.roles.resolve(r)).filter((r) => r !== null) : []
                let deleteRoleID = args.slice(2).join(' ').match(/{removerole(:(.|\d)+}){1,2}/gi) ? args.slice(2).join(' ').match(/{removerole(:(.|\d)+}){1,2}/gi)[0].split(':').slice(1).map((r) => msg.guild.roles.resolve(r)).filter((r) => r !== null) : []
                if (!message && !embed_name) return msg.channel.send('Debes poner un mensaje o embed para enviar o los dos')
                if (embed_name) {
                    let checkear = await this.client.db.embed.findOne({ guildID: msg.guild.id, embed_name }).exec()
                    if (!checkear) return msg.channel.send('No hay un embed con ese nombre')
                }
                if (addRoleID.some(r => !r.editable)) return msg.channel.send('No puedo dar ese rol.')
                if (deleteRoleID.some(r => !r.editable)) return msg.channel.send('No puedo quitar ese rol')
                tag.deleteRoleID = deleteRoleID
                tag.embed_name = embed_name
                tag.addRoleID = addRoleID
                tag.message = message
                tag.save()
                msg.channel.send(`Tag con el nombre **${args[1].toLowerCase()}** editado correctamente`)
                break;
            }
            case 'delete': {
                if (!args[1]) return msg.channel.send('Pon un nombre válido')
                let tag = await this.client.db.tags.findOneAndDelete({ guildID: msg.guild.id, name: args[1].toLowerCase() }).exec()
                if (!tag) return msg.channel.send('No existe un tag con ese nombre')
                msg.channel.send(`Tag con el nombre **${args[1].toLowerCase()}** eliminado correctamente`)
                break;
            }
        }
    }
}