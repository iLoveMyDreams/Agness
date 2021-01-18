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
        if (!args[0]) return msg.channel.send('> Pon una propiedad válida')
        switch (args[0].toLowerCase()) {
            case 'create': {
                if (!args[1]) return msg.channel.send(`> No colocaste el nombre del embed a crear.`)
                let checkear = await this.client.db.embed.findOne({ guildID: guild.id, embed_name: args[1] })
                if (checkear) return msg.channel.send('> Ya hay un embed con ese nombre')
                let nuevo = new this.client.db.embed({ guildID: guild.id, embed_name: args[1] })
                await nuevo.save()
                msg.channel.send('> Embed creado correctamente.')
                break;
            }
            case 'delete': {
                if (!args[1]) return msg.channel.send(`> No colocaste el nombre del embed a crear.`)
                let checkear = await this.client.db.embed.findOneAndDelete({ guildID: guild.id, embed_name: args[1] })
                if (!checkear) return msg.channel.send('> No hay ningún embed con ese nombre.')
                msg.channel.send('> Embed eliminado correctamente.')
                break;
            }
            case 'list': {
                const lista = await this.client.db.embed.find({ guildID: guild.id })
                const embed = new Discord.MessageEmbed()
                if (!lista.length) {
                    embed.setDescription('> El servidor no cuenta con ningún embed')
                    return msg.channel.send(embed)
                }
                embed.setAuthor(
                    `Lista de embeds de ${guild.name}`,
                    guild.iconURL() ?
                        guild.iconURL({ dynamic: true }) :
                        null
                )
                    .setDescription(lista.map(x => x.embed_name).join('\n'))
                msg.channel.send(embed)
                break;
            }
            case 'edit': {
                if (!args[1]) return msg.channel.send(`> No puedo encontrar un embed con ese nombre. O tal vez estás ejecutando mal el comando, forma correcta:
> ${this.prefix}embed edit <nombre> <propiedad> [texto]`)

                let embed_DB = await this.client.db.embed.findOne({ guildID: guild.id, embed_name: args[1] })
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
                const replaceText = (text) => EmbedCommand.replaceText(text, { channel: msg.channel, member: msg.member, prefix: this.prefix })

                if (embed_DB.author_text) {
                    embed_DB.author_image ?
                        embed.setAuthor(replaceText(embed_DB.author_text), replaceText(embed_DB.author_image)) :
                        embed.setAuthor(replaceText(embed_DB.author_text))
                }
                if (embed_DB.title) embed.setTitle(replaceText(embed_DB.title))
                if (embed_DB.description) embed.setDescription(replaceText(embed_DB.description))
                if (embed_DB.thumbnail) embed.setThumbnail(replaceText(embed_DB.thumbnail))
                if (embed_DB.image) embed.setImage(replaceText(embed_DB.image))

                if (embed_DB.footer_text) {
                    embed_DB.footer_image ?
                        embed.setFooter(replaceText(embed_DB.footer_text), replaceText(embed_DB.footer_image)) :
                        embed.setFooter(replaceText(embed_DB.footer_text))
                }
                if (embed_DB.timestamp) embed.setTimestamp()
                if (embed_DB) embed.setColor('#' + embed_DB.color)

                msg.channel.send(embed)
                break;
            }
            case 'preview': {
                let embed_DB = await this.client.db.embed.findOne({ guildID: guild.id, embed_name: args[1] })

                const embed = new Discord.MessageEmbed()
                if (embed_DB.author_text) {
                    embed_DB.author_image ?
                        embed.setAuthor(replaceText(embed_DB.author_text), replaceText(embed_DB.author_image)) :
                        embed.setAuthor(replaceText(embed_DB.author_text))
                }
                if (embed_DB.title) embed.setTitle(replaceText(embed_DB.title))
                if (embed_DB.description) embed.setDescription(replaceText(embed_DB.description))
                if (embed_DB.thumbnail) embed.setThumbnail(replaceText(embed_DB.thumbnail))
                if (embed_DB.image) embed.setImage(replaceText(embed_DB.image))

                if (embed_DB.footer_text) {
                    embed_DB.footer_image ?
                        embed.setFooter(replaceText(embed_DB.footer_text), replaceText(embed_DB.footer_image)) :
                        embed.setFooter(replaceText(embed_DB.footer_text))
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

    static replaceText(text, { chanenl, member, prefix }) {
        return text.replace(/{user}/gi, member.user.toString())
            .replace(/{user\.tag}/gi, member.user.tag)
            .replace(/{user\.discrim}/gi, member.user.discriminator)
            .replace(/{user\.avatar}/gi, member.user.displayAvatarURL({ dynamic: true, size: 4096 }))
            .replace(/{user\.name}/gi, member.user.username)
            .replace(/{user\.id}/gi, member.user.id)
            .replace(/{user\.joindate}/gi, member.joinedAt)
            .replace(/{user\.nick}/gi, member.nickname ? member.nickname : 'No tiene Apodo.')
            .replace(/{user\.createdate}/gi, member.user.createdAt)
            .replace(/{server\.prefix}/gi, prefix)
            .replace(/{server}/gi, member.guild.name)
            .replace(/{server\.id}/gi, member.guild.id)
            .replace(/{server\.membercount}/gi, member.guild.members.cache.size)
            .replace(/{server\.membercount\.nobots}/gi, member.guild.members.cache.filter(miembro => !miembro.user.bot).size)
            .replace(/{server\.membercount\.bots}/gi, member.guild.members.cache.filter(miembro => miembro.user.bot).size)
            .replace(/{server\.rolecount}/gi, member.guild.roles.cache.size)
            .replace(/{server\.channelcount}/gi, member.guild.channels.cache.size)
            .replace(/{server\.channelcount\.text}/gi, member.guild.channels.cache.filter((a) => a.type === 'text').size)
            .replace(/{server\.channelcount\.voice}/gi, member.guild.channels.cache.filter((a) => a.type === 'voice').size)
            .replace(/{server\.emojiscount}/gi, member.guild.emojis.cache.size)
            .replace(/{server\.emojiscount\.animate}/gi, member.guild.emojis.cache.filter((a) => a.animated).size)
            .replace(/{server\.emojiscount\.noanimate}/gi, member.guild.emojis.cache.filter((a) => !a.animated).size)
            .replace(/{server\.createdate}/gi, member.guild.createdAt)
            .replace(/{server\.boostlevel}/gi, member.guild.premiumTier)
            .replace(/{server\.boostcount}/gi, member.guild.premiumSubscriptionCount)
            .replace(/{server\.icon}/gi, member.guild.icon ? member.guild.iconURL({ dynamic: true, size: 4096 }) : 'https://cdn.discordapp.com/embed/avatars/0.png?size=2048')
            .replace(/{server\.owner}/gi, member.guild.owner.user.toString())
            .replace(/{server\.owner\.name}/gi, member.guild.owner.user.username)
            .replace(/{server\.owner\.id}/gi, member.guild.owner.user.id)
            .replace(/{server\.owner\.nick}/gi, member.guild.owner.nickname ? member.guild.owner.nickname : 'No tiene Apodo.')
            .replace(/{server\.owner\.avatar}/gi, member.guild.owner.user.displayAvatarURL({ size: 4096, dynamic: true }))
            .replace(/{server\.owner\.createdate}/gi, member.guild.owner.user.createdAt)
            .replace(/{channel}/gi, channel)
            .replace(/{channel\.id}/gi, channel.id)
            .replace(/{channel\.name}/gi, channel.name)
            .replace(/{channel\.createdate}/gi, channel.createdAt)
    }
}