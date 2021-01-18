const BaseCommand = require('../../Utils/BaseCommand.js')
const isImageURL = require('image-url-validator');
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
        if (!args[0]) return msg.channel.send('> Pon una propiedad valida')
        switch (args[0].toLowerCase()) {
            case 'create': {
                if (!args[1]) return msg.channel.send(`> No colocaste el nombre del embed a crear.`)
                let checkear = await this.client.db.embed.findOne({ guildID: msg.guild.id, embed_name: args[1] })
                if (checkear) return msg.channel.send('> Ya hay un embed con ese nombre')
                let nuevo = new this.client.db.embed({ guildID: msg.guild.id, embed_name: args[1] })
                await nuevo.save()
                msg.channel.send('> Embed creado correctamente.')
                break;
            }
            case 'delete': {
                if (!args[1]) return msg.channel.send(`> No colocaste el nombre del embed a crear.`)
                let checkear = await this.client.db.embed.findOneAndDelete({ guildID: msg.guild.id, embed_name: args[1] })
                if (!checkear) return msg.channel.send('> No hay ningún embed con ese nombre.')
                msg.channel.send('> Embed eliminado correctamente.')
                break;
            }
            case 'list': {
                const lista = await this.client.db.embed.find({ guildID: msg.guild.id })
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

                let embed_DB = await this.client.db.embed.findOne({ guildID: msg.guild.id, embed_name: args[1] })
                if (!embed_DB) return msg.channel.send(`> No puedo encontrar un embed con ese nombre. O tal vez estás ejecutando mal el comando, forma correcta:
> ${this.prefix}embed edit <nombre> <propiedad> [texto]`)

                const edit = args[2]

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
                        embed.setAuthor(this.replaceText(embed_DB.author_text), this.replaceText(embed_DB.author_image)) :
                        embed.setAuthor(this.replaceText(embed_DB.author_text))
                }
                if (embed_DB.title) embed.setTitle(this.replaceText(embed_DB.title))
                if (embed_DB.description) embed.setDescription(this.replaceText(embed_DB.description))
                if (embed_DB.thumbnail) embed.setThumbnail(this.replaceText(embed_DB.thumbnail))
                if (embed_DB.image) embed.setImage(this.replaceText(embed_DB.image))

                if (embed_DB.footer_text) {
                    embed_DB.footer_image ?
                        embed.setFooter(this.replaceText(embed_DB.footer_text), this.replaceText(embed_DB.footer_image)) :
                        embed.setFooter(this.replaceText(embed_DB.footer_text))
                }
                if (embed_DB.timestamp) embed.setTimestamp()
                if (embed_DB) embed.setColor('#' + embed_DB.color)

                msg.channel.send(embed)
                break;
            }
            case 'preview': {
                let embed_DB = await this.client.db.embed.findOne({ guildID: msg.guild.id, embed_name: args[1] })

                const embed = new Discord.MessageEmbed()
                if (embed_DB.author_text) {
                    embed_DB.author_image ?
                        embed.setAuthor(this.replaceText(embed_DB.author_text), this.replaceText(embed_DB.author_image)) :
                        embed.setAuthor(this.replaceText(embed_DB.author_text))
                }
                if (embed_DB.title) embed.setTitle(this.replaceText(embed_DB.title))
                if (embed_DB.description) embed.setDescription(this.replaceText(embed_DB.description))
                if (embed_DB.thumbnail) embed.setThumbnail(this.replaceText(embed_DB.thumbnail))
                if (embed_DB.image) embed.setImage(this.replaceText(embed_DB.image))

                if (embed_DB.footer_text) {
                    embed_DB.footer_image ?
                        embed.setFooter(this.replaceText(embed_DB.footer_text), this.replaceText(embed_DB.footer_image)) :
                        embed.setFooter(this.replaceText(embed_DB.footer_text))
                }
                if (embed_DB.timestamp) embed.setTimestamp()
                if (embed_DB) embed.setColor('#' + embed_DB.color)

                msg.channel.send(embed)
                break;
            }
            default:
                msg.channel.send('> Introduce una propiedad válida.')
                break;
        }
    }

    replaceText(text) {
        return text.replace(/{user}/gi, msg.author.toString())
            .replace(/{user\.tag}/gi, msg.author.tag)
            .replace(/{user\.discrim}/gi, msg.author.discriminator)
            .replace(/{user\.avatar}/gi, msg.author.displayAvatarURL({ dynamic: true, size: 4096 }))
            .replace(/{user\.name}/gi, msg.author.username)
            .replace(/{user\.id}/gi, msg.author.id)
            .replace(/{user\.joindate}/gi, msg.member.joinedAt)
            .replace(/{user\.nick}/gi, msg.member.nickname ? msg.member.nickname : 'No tiene Apodo.')
            .replace(/{user\.createdate}/gi, msg.author.createdAt)
            .replace(/{server\.prefix}/gi, this.prefix)
            .replace(/{server}/gi, msg.guild.name)
            .replace(/{server\.id}/gi, msg.guild.id)
            .replace(/{server\.membercount}/gi, msg.guild.members.cache.size)
            .replace(/{server\.membercount\.nobots}/gi, msg.guild.members.cache.filter(miembro => !miembro.user.bot).size)
            .replace(/{server\.membercount\.bots}/gi, msg.guild.members.cache.filter(miembro => miembro.user.bot).size)
            .replace(/{server\.rolecount}/gi, msg.guild.roles.cache.size)
            .replace(/{server\.channelcount}/gi, msg.guild.channels.cache.size)
            .replace(/{server\.channelcount\.text}/gi, msg.guild.channels.cache.filter((a) => a.type === 'text').size)
            .replace(/{server\.channelcount\.voice}/gi, msg.guild.channels.cache.filter((a) => a.type === 'voice').size)
            .replace(/{server\.emojiscount}/gi, msg.guild.emojis.cache.size)
            .replace(/{server\.emojiscount\.animate}/gi, msg.guild.emojis.cache.filter((a) => a.animated).size)
            .replace(/{server\.emojiscount\.noanimate}/gi, msg.guild.emojis.cache.filter((a) => !a.animated).size)
            .replace(/{server\.createdate}/gi, msg.guild.createdAt)
            .replace(/{server\.boostlevel}/gi, msg.guild.premiumTier)
            .replace(/{server\.boostcount}/gi, msg.guild.premiumSubscriptionCount)
            .replace(/{server\.icon}/gi, msg.guild.iconURL() ? msg.guild.iconURL({ dynamic: true, size: 4096 }) : msg.author.displayAvatarURL({ dynamic: true, size: 4096 }))
            .replace(/{server\.owner}/gi, msg.guild.owner.user.toString())
            .replace(/{server\.owner\.name}/gi, msg.guild.owner.user.username)
            .replace(/{server\.owner\.id}/gi, msg.guild.owner.user.id)
            .replace(/{server\.owner\.nick}/gi, msg.guild.owner.nickname ? msg.guild.owner.nickname : 'No tiene Apodo.')
            .replace(/{server\.owner\.avatar}/gi, msg.guild.owner.user.displayAvatarURL({ size: 4096, dynamic: true }))
            .replace(/{server\.owner\.createdate}/gi, msg.guild.owner.user.createdAt)
            .replace(/{channel}/gi, msg.channel)
            .replace(/{channel\.id}/gi, msg.channel.id)
            .replace(/{channel\.name}/gi, msg.channel.name)
            .replace(/{channel\.createdate}/gi, msg.channel.createdAt)
    }
}