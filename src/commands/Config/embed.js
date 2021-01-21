const BaseCommand = require('../../Utils/BaseCommand.js')
const isImageURL = require('image-url-validator')

module.exports = class EmbedCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'embed',
            alias: ['eb', 'emb'],
            category: 'Config',
            memberGuildPermissions: ['ADMINISTRATOR'],
        })
    }

    async run(msg, args) {
        let exceptions = ['{user.avatar}', '{server.icon}', '{server.owner.avatar}']
        if (!args[0]) {
            const embed = new Discord.MessageEmbed()
                .setTitle(`¿Para que sirve un embed?`)
                .setDescription(`Te permitirá crear un texto con mayor estética para insertarlos en tus bienvenidas, despedidas, reglas, etc., para mejorar en cuanto estética a tu servidor. Lo siguiente son pasos para poder crear y editar tu embed.`)
                .addField(`**1. Creando y poniéndole un nombre**`, `El nombre nos permitirá identificar nuestro embed para que no se mezcle con los demás a la hora de ponerlos en bienvenidas, despedidas, etc. ¿Cómo? Pues agregando \`{embed:[name]}\`.Remplazando \`name\` por el nombre de nuestro embed. Para esto puedes crearlo y ponerle el nombre que gustes así:\n> \`${this.prefix}embed create [name]\``)
                .addField(`**2. Editando nuestro embed**`, `Bueno llegó la hora de editarlo de la manera que tu quieras, ¡Tu creatividad importa!, a continuación te muestro las propiedades del embed:\n> \`author\` - [ text | link de imagen(opcional) ]\n> \`thumbnail\` - [ link imagen ])\n> \`title\` - [ text ]\n> \`description\` - [ text ]\n> \`footer\` - [ text | link de imagen(opcional) ]\n> \`image\` - [ link de imagen(opcional) ]\n> \`color\` - [ hex code ]\n> \`timestamp\` - [ yes/no ]\nEl modo de uso es intuitivo con lo cual les sera más fácil aprenderse cada propiedad y el modo de edición del embed, y es el siguiente:\n> \`${this.prefix}embed edit [name] [propiedad] [valor]\``)
                .addField(`**EJEMPLO**`, `Ahora veamos un pequeño ejemplo con algunas propiedades, el cual les permitirá familiarizarse con el simple formato\nComenzamos creando un embed el cual llamaremos \`ejemplo\`.\n> \`${this.prefix}embed create ejemplo\`\nAhora a ponerle un título atractivo\n> \`${this.prefix}embed edit ejemplo title Estoy aprendiendo a editar un embed\`\nBueno ahora pongámosle una descripción.\n> \`${this.prefix}embed edit ejemplo description Esta descripción se ve muy linda\`\nListo pongámosle una imagen y tendremos un simple embed, ten cuidado y pon links que verdaderamente contengan imágenes/gifs. En este caso pondremos un divertido gif.\n> \`${this.prefix}embed edit ejemplo image https://i.imgur.com/mXOijAT.gif\`\nPor último pongámosle un color el cual tiene que ser en código hexadecimal sin el #, si no lo conoces puedes ver los colores [aqui](https://htmlcolorcodes.com/es/).\n> \`${this.prefix}embed edit ejemplo color e658ff\`\nListo esto es un simple embed que si quieres puedes probar tu mismo.`)
                .addField(`**VARIABLES**`, `Primero que nada ¿qué son las variables? Bueno para eso estoy, las propiedades nos permitiran que podamos hacer cosas "automatizadas" de manera que se puedan remplazar por nombres, canales, links, entre otros, se pueden usar en embeds como también en texto, para las bienvenidas y despedidas. Aquí te doy algunos:\n\`{user}\` - @mención (e.j. @Aviii#5859)\n\`{server}\` - nombre del servidor (e.j. Asuna's Support)\n\`{server.prefix}\` - prefijo del servidor (por defecto: s!)\n Puedes encontrar la lista completa con \`${this.prefix}variables\``)
                .setColor('#fab1d7')
                .setTimestamp()
                .setFooter(`Asuna embeds`)
                .setImage('https://i.imgur.com/c3Gii3Z.png')
            return msg.channel.send(embed)
        }
        const replaceText = (text) => this.client.replaceText(text, { channel: msg.channel, member: msg.member, prefix: this.prefix })
        switch (args[0].toLowerCase()) {
            case 'create': {
                const lista = await this.client.db.embed.find({ guildID: msg.guild.id }).exec()
                if(lista.length >= 10) return msg.channel.send('> Por ahora solo se pueden tener 10 embeds por servidor')
                if (!args[1]) return msg.channel.send(`> No colocaste el nombre del embed a crear.`)
                let checkear = await this.client.db.embed.findOne({ guildID: msg.guild.id, embed_name: args[1] }).exec()
                if (checkear) return msg.channel.send('> Ya hay un embed con ese nombre')
                let nuevo = new this.client.db.embed({ guildID: msg.guild.id, embed_name: args[1] })
                await nuevo.save()
                msg.channel.send('> Embed creado correctamente.')
                break;
            }
            case 'delete': {
                if (!args[1]) return msg.channel.send(`> No colocaste el nombre del embed a crear.`)
                let checkear = await this.client.db.embed.findOneAndDelete({ guildID: msg.guild.id, embed_name: args[1] }).exec()
                if (!checkear) return msg.channel.send('> No hay ningún embed con ese nombre.')
                msg.channel.send('> Embed eliminado correctamente.')
                break;
            }
            case 'list': {
                const lista = await this.client.db.embed.find({ guildID: msg.guild.id }).exec()
                const embed = new Discord.MessageEmbed()
                if (!lista.length) {
                    embed.setDescription('> El servidor no cuenta con ningún embed')
                    return msg.channel.send(embed)
                }
                embed.setAuthor(
                    `Lista de embeds de ${msg.guild.name}`,
                    msg.guild.iconURL() ?
                        msg.guild.iconURL({ dynamic: true }) :
                        null
                )
                    .setDescription(lista.map(x => x.embed_name).join('\n'))
                msg.channel.send(embed)
                break;
            }
            case 'edit': {
                if (!args[1]) return msg.channel.send(`> No puedo encontrar un embed con ese nombre. O tal vez estás ejecutando mal el comando, forma correcta:
> ${this.prefix}embed edit <nombre> <propiedad> [texto]`)

                let embed_DB = await this.client.db.embed.findOne({ guildID: msg.guild.id, embed_name: args[1] }).exec()
                if (!embed_DB) return msg.channel.send(`> No puedo encontrar un embed con ese nombre. O tal vez estás ejecutando mal el comando, forma correcta:
> ${this.prefix}embed edit <nombre> <propiedad> [texto]`)

                const edit = args[2].toLowerCase()

                if (edit == 'author') {
                    if (!args[3]) return msg.channel.send('Coloca algo')
                    const parts = args.slice(3).join(' ').split(' | ')
                    if (parts.length === 1) {
                        embed_DB.author_text = parts[0]

                    } else if (parts.length === 2) {
                        if (!exceptions.includes(parts[1])) {
                            if (
                                !(await isImageURL(parts[1]))
                            ) return msg.channel.send('Pon una url válida para la imagen.')
                        }
                        embed_DB.author_text = parts[0]
                        embed_DB.author_image = parts[1]
                    } else {
                        return msg.channel.send('> Creo que te equivocaste. Intenta de nuevo')
                    }
                }
                else if (edit === 'title') {
                    if (!args[3]) return msg.channel.send('Coloca algo')
                    embed_DB.title = args.slice(3).join(' ')
                }
                else if (edit === 'description') {
                    if (!args[3]) return msg.channel.send('Coloca algo')
                    embed_DB.description = args.slice(3).join(' ')
                }
                else if (edit == 'thumbnail') {
                    if (!args[3]) return msg.channel.send('Coloca la imagen')
                    if (args[4]) return msg.channel.send('Qué tratas de hacer?')
                    if (!exceptions.includes(args[3])) {
                        if (
                            !(await isImageURL(args[3]))
                        ) return msg.channel.send('Pon una url valida para la imagen.')
                    }
                    embed_DB.thumbnail = args[3]
                }
                else if (edit == 'image') {
                    if (!args[3]) return msg.channel.send('Coloca la imagen')
                    if (args[4]) return msg.channel.send('Qué tratas de hacer?')
                    if (!exceptions.includes(args[3])) {
                        if (
                            !(await isImageURL(args[3]))
                        ) return msg.channel.send('Pon una url válida para la imagen.')
                    }
                    embed_DB.image = args[3]
                }
                else if (edit == 'footer') {
                    if (!args[3]) return msg.channel.send('Coloca algo')
                    const parts = args.slice(3).join(' ').split(' | ')
                    if (parts.length === 1) {
                        embed_DB.footer_text = parts[0]

                    } else if (parts.length === 2) {
                        if (!exceptions.includes(parts[1])) {
                            if (
                                !(await isImageURL(parts[1]))
                            ) return msg.channel.send('Pon una url válida para la imagen.')
                        }
                        embed_DB.footer_text = parts[0]
                        embed_DB.footer_image = parts[1]
                    } else {
                        return msg.channel.send('> Creo que te equivocaste. Intenta de nuevo')
                    }
                }
                else if (edit == 'timestamp') {
                    if (args[3] === 'yes') {
                        embed_DB.timestamp = true
                    } else if (args[3] === 'no') {
                        embed_DB.timestamp = false
                    } else {
                        return msg.channel.send('Pon yes/no')
                    }
                }
                else if (edit == 'color') {
                    if (!args[3]) return msg.channel.send('Pon un color hex sin #')
                    if (args[4]) return msg.channel.send('Qué tratas de hacer?')
                    var isOk = /^[0-9A-F]{6}$/i.test(args[3])
                    if (isOk === false) return msg.channel.send('¡Por favor, proporciona un código hex válido, sin #!')
                    embed_DB.color = args[3]
                }
                else {
                    return msg.channel.send('> La propiedad que colocaste no es válida.')
                }
                embed_DB.save()

                const embed = new Discord.MessageEmbed()

                if (embed_DB.author_text) {
                    embed_DB.author_image ?
                        embed.setAuthor(await replaceText(embed_DB.author_text), await replaceText(embed_DB.author_image)) :
                        embed.setAuthor(await replaceText(embed_DB.author_text))
                }
                if (embed_DB.title) embed.setTitle(await replaceText(embed_DB.title))
                if (embed_DB.description) embed.setDescription(await replaceText(embed_DB.description))
                if (embed_DB.thumbnail) embed.setThumbnail(await replaceText(embed_DB.thumbnail))
                if (embed_DB.image) embed.setImage(await replaceText(embed_DB.image))

                if (embed_DB.footer_text) {
                    embed_DB.footer_image ?
                        embed.setFooter(await replaceText(embed_DB.footer_text), await replaceText(embed_DB.footer_image)) :
                        embed.setFooter(await replaceText(embed_DB.footer_text))
                }
                if (embed_DB.timestamp) embed.setTimestamp()
                if (embed_DB) embed.setColor('#' + embed_DB.color)

                msg.channel.send(embed)
                break;
            }
            case 'preview': {
                if (!args[1]) return msg.channel.send(`> No puedo encontrar un embed con ese nombre. O tal vez estás ejecutando mal el comando, forma correcta:
> ${this.prefix}embed preview <nombre> `)
                let embed_DB = await this.client.db.embed.findOne({ guildID: msg.guild.id, embed_name: args[1] }).exec()
                if (!embed_DB) return msg.channel.send(`> No puedo encontrar un embed con ese nombre. O tal vez estás ejecutando mal el comando, forma correcta:
> ${this.prefix}embed preview <nombre> `)
                const embed = new Discord.MessageEmbed()
                if (embed_DB.author_text) {
                    embed_DB.author_image ?
                        embed.setAuthor(await replaceText(embed_DB.author_text), await replaceText(embed_DB.author_image)) :
                        embed.setAuthor(await replaceText(embed_DB.author_text))
                }
                if (embed_DB.title) embed.setTitle(await replaceText(embed_DB.title))
                if (embed_DB.description) embed.setDescription(await replaceText(embed_DB.description))
                if (embed_DB.thumbnail) embed.setThumbnail(await replaceText(embed_DB.thumbnail))
                if (embed_DB.image) embed.setImage(await replaceText(embed_DB.image))

                if (embed_DB.footer_text) {
                    embed_DB.footer_image ?
                        embed.setFooter(await replaceText(embed_DB.footer_text), await replaceText(embed_DB.footer_image)) :
                        embed.setFooter(await replaceText(embed_DB.footer_text))
                }
                if (embed_DB.timestamp) embed.setTimestamp()
                if (embed_DB) embed.setColor('#' + embed_DB.color)

                msg.channel.send(embed)
                break;
            }
            case 'propiedades':
            case 'properties': {
                msg.channel.send(`**Propiedades de un embed**
> \`author\` - [ text | link de imagen(opcional) ]
> \`thumbnail\` - [ link imagen ]
> \`title\` - [ text ]
> \`description\` - [ text ]
> \`footer\` - [ text | link de imagen(opcional) ]
> \`image\` - [ link de imagen(opcional) ]
> \`color\` - [ hex code ]
> \`timestamp\` - [ yes/no ]`)
                break;
            }
            default:
                msg.channel.send(`> Introduce una propiedad válida. Utiliza \`${this.prefix}embed\` para ver un mini tutorial.`)
                break;
        }
    }
}