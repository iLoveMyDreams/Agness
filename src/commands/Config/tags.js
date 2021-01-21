const BaseCommand = require('../../Utils/BaseCommand.js')

module.exports = class TagsCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'tag',
            alias: ['tags'],
            botGuildPermissions: ['MANAGE_ROLES'],
            memberGuildPermissions: ['ADMINISTRATOR'],
            category: 'Config'
        })
    }

    async run(msg, args) {
        let embedCorrect = new Discord.MessageEmbed()
            .addField(
                'Uso correcto:',
                `> ${this.prefix}tag [add/edit/delete] [tag_name] <propiedades>`)
            .setFooter(`Para ver las propiedades usa: ${this.prefix}tag propiedades`)
        if (!args[0]) return msg.channel.send(embedCorrect)
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
                variables.forEach((variable) => {
                    let [name, ...values] = variable.split(':')
                    if (!Object.keys(options).concat('addRole', 'removeRole').includes(name)) return;
                    if (name === 'addRole') name = 'addrole'
                    if (name === 'removeRole') name = 'removerole'
                    if (['addrole', 'removerole'].includes(name)) options[name] = values.map((r) => msg.guild.roles.resolve(r));
                    else options[name] = !values[1] && values[0] ? values[0] : values
                })
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
                variables.forEach((variable) => {
                    let [name, ...values] = variable.split(':')
                    if (!Object.keys(options).concat('addRole', 'removeRole').includes(name)) return;
                    if (name === 'addRole') name = 'addrole'
                    if (name === 'removeRole') name = 'removerole'
                    if (['addrole', 'removerole'].includes(name)) options[name] = values.map((r) => msg.guild.roles.resolve(r));
                    else options[name] = !values[1] && values[0] ? values[0] : values
                })
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
            case 'propiedades':
            case 'properties': {
                msg.channel.send(`**Propiedades de un embed**
> \`{message:[text]}\` - Mensajes normales.
> \`{embed:[embed_name]}\` - Insertar un embed ya creado.
> \`{addRole:[rolID]}\` - Añade un rol.
> \`{removeRole:[roleID]}\` - Remueve un rol.`)
                break;
            }
            default: {
                msg.channel.send(embedCorrect)
                break;
            }
        }
    }
}