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
                if (this.client.commands.find(c => c.name === args[1].toLowerCase() || c.alias.includes(args[1].toLowerCase()))) return msg.channel.send('No puedes crear un tag con el nombre de un comando')
                let tag = await this.client.db.tags.findOne({ guildID: msg.guild.id, name: args[1].toLowerCase() }).exec()
                if (tag) return msg.channel.send('Ya existe un tag con ese nombre')
                let variables = args.slice(2).join(' ').split('{').map((s) => s.split('}')[0])
                let options = {
                    message: '',
                    embed: '',
                    addrole: [],
                    removerole: []
                }
                for (let variable of variables) {
                    let [name, ...values] = variable.split(':')
                    if (['addrole', 'removerole'].includes(name)) options[name] = values.map((r) => msg.guild.roles.resolve(r));
                    else options[name] = !values[1] && values[0] ? values[0] : values
                }
                if (!options.message && !options.embed) return msg.channel.send('Debes poner un mensaje o embed para enviar o los dos')
                if (options.embed) {
                    let checkear = await this.client.db.embed.findOne({ guildID: msg.guild.id, embed_name: options.embed }).exec()
                    if (!checkear) return msg.channel.send('No hay un embed con ese nombre')
                }
                if (options.addrole.some(r => !r || !r.editable)) return msg.channel.send('No existe o no puedo dar ese rol.')
                if (options.removerole.some(r => !r || !r.editable)) return msg.channel.send('No existe o no puedo quitar ese rol')
                tag = new this.client.db.tags({
                    guildID: msg.guild.id,
                    name: args[1].toLowerCase(),
                    removeRoleID: options.removerole.map((r) => r.id),
                    addRoleID: options.addrole.map((r) => r.id),
                    embed_name: options.embed,
                    message: options.message
                })
                tag.save()
                msg.channel.send(`Tag con el nombre **${args[1].toLowerCase()}** creado correctamente`)
                break;
            }
            case 'edit': {
                if (!args[1]) return msg.channel.send('Pon un nombre válido')
                let tag = await this.client.db.tags.findOne({ guildID: msg.guild.id, name: args[1].toLowerCase() }).exec()
                if (!tag) return msg.channel.send('No existe un tag con ese nombre')
                let variables = args.slice(2).join(' ').split('{').map((s) => s.split('}')[0])
                let options = {
                    message: '',
                    embed: '',
                    addrole: [],
                    removerole: []
                }
                for (let variable of variables) {
                    let [name, ...values] = variable.split(':')
                    if (['addrole', 'removerole'].includes(name)) options[name] = values.map((r) => msg.guild.roles.resolve(r));
                    else options[name] = !values[1] && values[0] ? values[0] : values
                }
                if (!options.message && !options.embed) return msg.channel.send('Debes poner un mensaje o embed para enviar o los dos')
                if (options.embed) {
                    let checkear = await this.client.db.embed.findOne({ guildID: msg.guild.id, embed_name: options.embed }).exec()
                    if (!checkear) return msg.channel.send('No hay un embed con ese nombre')
                }
                if (options.addrole.some(r => !r || !r.editable)) return msg.channel.send('No existe o no puedo dar ese rol.')
                if (options.removerole.some(r => !r || !r.editable)) return msg.channel.send('No existe o no puedo quitar ese rol')
                tag.deleteRoleID = options.removerole.map((r) => r.id)
                tag.addRoleID = options.addrole.map((r) => r.id)
                tag.embed_name = options.embed
                tag.message = options.message
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