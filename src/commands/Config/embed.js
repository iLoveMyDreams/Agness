const BaseCommand = require('../../Utils/BaseCommand.js')
module.exports = class EmbedCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'embed',
            alias: ['eb', 'emb']
        })
    }
    async run(msg, args) {
        let exceptions = ['{user_avatar}', '{server_icon}', '{server_owner_avatar}']
        switch (args[1]) {
            case 'create':{

                if (!args[1]) return msg.channel.send(`> No colocaste el nombre del embed a crear.`)
                let checkear = await this.client.db.embed.findOne({ guildID: msg.guild.id, embed_name: args[1] })
                if (checkear) return msg.channel.send('> Ya hay un embed con ese nombre')
                let nuevo = new this.client.db.embed({ guildID: msg.guild.id, embed_name: args[1] })
                await nuevo.save()
                msg.channel.send('> Embed creado correctamente.')
            }
                break;

            case 'delete': {

                if (!args[1]) return msg.channel.send(`> No colocaste el nombre del embed a crear.`)
                let checkear = await this.client.db.embed.findOneAndDelete({ guildID: msg.guild.id, embed_name: args[1] })
                if (!checkear) return msg.channel.send('> No hay ningun embed con ese nombre.')
                msg.channel.send('> Embed eliminado correctamente.')
            }
                break;

            case 'list':{

                const lista = await this.client.db.embed.find({ guildID: msg.guild.id })
                const embed = new MessageEmbed()
                if (!lista.length) {
                    embed.setDescription('> El servidor no cuenta con ningun embed')
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
            }
                break;

            case 'edit': {

                if (!args[1]) return msg.channel.send(`> No puedo encontrar un embed con ese nombre. O tal vez estas ejecutando mal el comando, forma correcta:
> ${prefix}embed edit <nombre> <propiedad> [texto]`)

                let embed_DB = await this.client.db.embed.findOne({ guildID: msg.guild.id, embed_name: args[1] })
                if (!embed_DB) return msg.channel.send(`> No puedo encontrar un embed con ese nombre. O tal vez estas ejecutando mal el comando, forma correcta:
> ${prefix}embed edit <nombre> <propiedad> [texto]`)

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
                            ) return msg.channel.send('Pon una url valida para la imagen.')
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
                    if (args[4]) return msg.channel.send('Que tratas de hacer?')
                    if (!exceptions.includes(args[3])) {
                        if (
                            !(await isImageURL(args[3]))
                        ) return msg.channel.send('Pon una url valida para la imagen.')
                    }
                    embed_DB.thumbnail = args[3]
                }
                else if (edit == 'image') {
                    if (!args[3]) return msg.channel.send('Coloca la imagen')
                    if (args[4]) return msg.channel.send('Que tratas de hacer?')
                    if (!exceptions.includes(args[3])) {
                        if (
                            !(await isImageURL(args[3]))
                        ) return msg.channel.send('Pon una url valida para la imagen.')
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
                            ) return msg.channel.send('Pon una url valida para la imagen.')
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
                    if (args[4]) return msg.channel.send('Que tratas de hacer?')
                    var isOk = /^[0-9A-F]{6}$/i.test(args[3])
                    if (isOk === false) return msg.channel.send("¡Por favor, proporciona un código hex válido, sin #!")
                    embed_DB.color = args[3]
                }
                else {
                    return msg.channel.send('> La propiedad que colocaste no es valida.')
                }
                embed_DB.save()
                embed_DB = await this.client.db.embed.findOne({ guildID: msg.guild.id, embed_name: args[1] })

                const embed = new Discord.MessageEmbed()

                if (embed_DB.author_text) {
                    embed_DB.author_image ?
                        embed.setAuthor(replaceText(embed_DB.author_text), replaceText(embed_DB.author_image)) :
                        embed.setAuthor(replaceText(embed_DB.author_text))
                }
                if (embed_DB.title) embed.setTitle(replaceText(embed_DB.title))
                if (embed_DB.description)  embed.setDescription(replaceText(embed_DB.description))
                if (embed_DB.thumbnail) embed.setThumbnail(replaceText(embed_DB.thumbnail))
                if (embed_DB.image) embed.setImage(replaceText(embed_DB.image))

                if (embed_DB.footer_text) {
                    embed_DB.footer_image ?
                        embed.setFooter(replaceText(embed_DB.footer_text), replaceText(embed_DB.footer_image)) :
                        embed.setFooter(replaceText(embed_DB.footer_text))
                }
                if (embed_DB.timestamp) embed.setTimestamp()
                if (embed_DB)  embed.setColor('#' + embed_DB.color)

                msg.channel.send(embed)
            }
                break;

            case 'preview': {

                let embed_DB = await this.client.db.embed.findOne({ guildID: msg.guild.id, embed_name: args[1] })

                const embed = new Discord.MessageEmbed()

                if (embed_DB.author_text) {
                    embed_DB.author_image ?
                        embed.setAuthor(replaceText(embed_DB.author_text), replaceText(embed_DB.author_image)) :
                        embed.setAuthor(replaceText(embed_DB.author_text))
                }
                if (embed_DB.title) embed.setTitle(replaceText(embed_DB.title))
                if (embed_DB.description)  embed.setDescription(replaceText(embed_DB.description))
                if (embed_DB.thumbnail) embed.setThumbnail(replaceText(embed_DB.thumbnail))
                if (embed_DB.image) embed.setImage(replaceText(embed_DB.image))

                if (embed_DB.footer_text) {
                    embed_DB.footer_image ?
                        embed.setFooter(replaceText(embed_DB.footer_text), replaceText(embed_DB.footer_image)) :
                        embed.setFooter(replaceText(embed_DB.footer_text))
                }
                if (embed_DB.timestamp) embed.setTimestamp()
                if (embed_DB)  embed.setColor('#' + embed_DB.color)

                msg.channel.send(embed)

            }
                break;

            default: {

                msg.channel.send('> Introduce una propiedad valida.')
            }
                break;
        }

        function replaceText(text) {
            return text.replace("{user}", `${msg.author}`)
            .replace("{user_tag}", msg.author.tag)
            .replace("{user_discrim}", msg.author.discriminator)
            .replace("{user_avatar}", msg.author.displayAvatarURL({dynamic: true, size: 4096}))
            .replace("{user_name}", msg.author.username)
            .replace("{user_id}", msg.author.id)
            .replace("{user_joindate}", msg.member.joinedAt)
            .replace("{user_nick}", msg.member.nickname ? msg.member.nickname : "No tiene Apodo.")
            .replace("{user_createdate}", msg.author.createdAt)
            .replace("{server_prefix}", prefix)
            .replace("{server}", msg.guild.name)
            .replace("{server_id}", msg.guild.id)
            .replace("{server_membercount}", msg.guild.members.cache.size)
            .replace("{server_membercount_nobots}", msg.guild.members.cache.filter(miembro => !miembro.user.bot).size)
            .replace("{server_membercount_bots}", msg.guild.members.cache.filter(miembro => miembro.user.bot).size)
            .replace("{server_rolecount}", msg.guild.roles.cache.size)
            .replace("{server_channelcount}", msg.guild.channels.cache.size)
            .replace("{server_channelcount_text}", msg.guild.channels.cache.filter((a) => a.type === "text").size)
            .replace("{server_channelcount_voice}", msg.guild.channels.cache.filter((a) => a.type === "voice").size)
            .replace("{server_emojiscount}", msg.guild.emojis.cache.size)
            .replace("{server_emojiscount_animate}", msg.guild.emojis.cache.filter((a) => a.animated).size)
            .replace("{server_emojiscount_noanimate}", msg.guild.emojis.cache.filter((a) => !a.animated).size)
            .replace("{server_createdate}", msg.guild.createdAt)
            .replace("{server_boostlevel}", msg.guild.premiumTier)
            .replace("{server_boostcount}", msg.guild.premiumSubscriptionCount)
            .replace("{server_icon}", msg.guild.iconURL() ? msg.guild.iconURL({dynamic: true, size: 4096}) : msg.author.displayAvatarURL({dynamic: true, size: 4096}))
            .replace("{server_owner}", msg.guild.owner.user.toString())
            .replace("{server_owner_name}", msg.guild.owner.user.username)
            .replace("{server_owner_id}", msg.guild.owner.user.id)
            .replace("{server_owner_nick}", msg.guild.owner.nickname ? msg.guild.owner.nickname : "No tiene Apodo.")
            .replace("{server_owner_avatar}", msg.guild.owner.user.displayAvatarURL({size: 4096, dynamic: true}))
            .replace("{server_owner_createdate}", msg.guild.owner.user.createdAt)
            .replace("{channel}", msg.channel)
            .replace("{channel_id}", msg.channel.id)
            .replace("{channel_name}", msg.channel.name)
            .replace("{channel_createdate}", msg.channel.createdAt)
        }
    }
}