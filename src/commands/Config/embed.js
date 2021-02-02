const BaseCommand = require('../../Utils/BaseCommand.js')
const isImageURL = require('image-url-validator')

module.exports = class EmbedCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'embed',
            alias: ['eb', 'emb'],
            description: 'Create custom embeds for your tags, welcomes and farewells. You put the design!',
            usage: (prefix) => `${prefix}embed [ create/edit/preview/delete/list ] < embed_name > < property > < value >`,
            example: (prefix) => `${prefix}embed create welcome`,
            category: 'Config',
            memberGuildPermissions: ['ADMINISTRATOR'],
        })
    }

    async run(msg, args) {
        let exceptions = ['{user.avatar}', '{server.icon}', '{server.owner.avatar}']
        if (!args[0]) {
            const embed = new Discord.MessageEmbed()
                .setTitle(`Why do I need an embed?`)
                .setDescription(`You may need it to make your server look much better aesthetically, since it will allow you to create rich text, which you can put in your welcomes, farewells and custom commands. Creativity is up to you!`)
                .addField(`1 Create and name your embed.`, `The name will allow us to identify our embed so that everything looks more orderly when it comes to putting it in welcomes, farewells and custom commands. How? Well, adding \`{embed:[embed_name]}\`. Replacing \`embed_name\` with the name of our embed. For this you can create it and give it the name you like like this:
> \`${this.prefix} embed create [embed_name]\``)
                .addField(`2. Editing our embed`, `Well, it's time to edit it the way you want, Your creativity matters! Here I show you the properties of the embed:
> \`author\` - [ text | < Image link > ]
> \`thumbnail\` - [ Image link ]
> \`title\` - [ text ]
> \`description\` - [ text ]
> \`footer\` - [ text | < Image link > ]
> \`image\` - [ Image link ]
> \`color\` - [ Hex Code ]
> \`timestamp\` - [ yes/no ]
The way of use is intuitive with which it will be easier for them to learn each property. Well without more, the embed editing mode, and it is as follows:
> \`${this.prefix}embed edit [ name ] [ property ] [ value ]\``)
                .addField(`**EXAMPLE**`, `Now let's look at a small example with some properties, which will allow you to familiarize yourself with the simple format.
We start by creating an embed which we will call \`example\`.
> \`${this.prefix}embed create example\`
Now to give it an attractive title
> \`${this.prefix}embed edit example title I am learning how to edit an embed.\`
Well now let's put a description on it.
> \`${this.prefix}embed edit example description This description looks very cute\`
Let's put an image on it and we will have a simple embed, be careful and put links that really contain images or gifs. In this case we will put a funny gif.
> \`${this.prefix}embed edit example image https://i.imgur.com/mXOijAT.gif\`
Finally let's put a color which has to be in hexadecimal code without the #, if you don't know them you can see the colors [here](https://htmlcolorcodes.com/es/).
> \`${this.prefix}embed edit example color e658ff\`
Ready this is a simple embed that if you want you can test yourself.`)
                .addField(`**VARIABLES**`, `First of all, what are variables? Well for that I am, the properties will allow us to do "automated" things so that they can be replaced by names, channels, links, among others, they can be used in embeds as well as in text, for welcomes and goodbyes. Here I give you some:
\`{user}\` - @Mention (e.j. @Aviii.#0721 ❤️)
\`{server}\` - Server name (e.j. ${this.client.user.username}'s Support)
You can find the full list with \`${this.prefix}variables\``)
                .setColor(this.client.color)
                .setTimestamp()
                .setFooter(`Asuna embeds`)
                .setImage('https://i.imgur.com/xqOg6Hj.png')
            return msg.channel.send(embed)
        }
        const replaceText = (text) => this.client.replaceText(text, { channel: msg.channel, member: msg.member, prefix: this.prefix })
        switch (args[0].toLowerCase()) {
            case 'create': {
                const lista = await this.client.db.embed.find({ guildID: msg.guild.id }).exec()
                if (lista.length >= 10) return msg.channel.send('For now you can only have 10 embeds per server.')
                if (!args[1]) return msg.channel.send(`You did not put the name of the embed to create.
> ${this.prefix}embed create [ embed_name ]`)
                let checkear = await this.client.db.embed.findOne({ guildID: msg.guild.id, embed_name: args[1] }).exec()
                if (checkear) return msg.channel.send('There is already an embed with that name. Try another.')
                let nuevo = new this.client.db.embed({ guildID: msg.guild.id, embed_name: args[1] })
                await nuevo.save()
                msg.channel.send(`Embed created successfully. Now you can edit it with:
> ${this.prefix}embed edit [ name ] [ property ] [ value ]`)
                break;
            }
            case 'delete': {
                if (!args[1]) return msg.channel.send(`You did not put the name of the embed that I should delete.
> ${this.prefix}embed delete [ embed_name ]`)
                let checkear = await this.client.db.embed.findOneAndDelete({ guildID: msg.guild.id, embed_name: args[1] }).exec()
                if (!checkear) return msg.channel.send('There is no embed with that name.')
                msg.channel.send('Embed removed successfully.')
                break;
            }
            case 'list': {
                const lista = await this.client.db.embed.find({ guildID: msg.guild.id }).exec()
                const embed = new Discord.MessageEmbed()
                    .setColor(this.client.color)
                if (!lista.length) {
                    embed.setDescription('The server does not have any embed.')
                    return msg.channel.send(embed)
                }
                embed.setAuthor(
                    `Embed list of ${msg.guild.name}`,
                    msg.guild.iconURL() ?
                        msg.guild.iconURL({ dynamic: true }) :
                        null
                )
                    .setDescription(lista.map(x => x.embed_name).join('\n'))
                msg.channel.send(embed)
                break;
            }
            case 'edit': {
                if (!args[1]) return msg.channel.send(`You didn't tell me the embed to edit. Or maybe you are executing the command wrong, right way:
> ${this.prefix}embed edit [ embed_name ] [ property ] [ value ]`)
                let embed_DB = await this.client.db.embed.findOne({ guildID: msg.guild.id, embed_name: args[1] }).exec()
                if (!embed_DB) return msg.channel.send(`I can't find an embed with that name. Or maybe you are executing the command wrong, right way:
> ${this.prefix}embed edit [ embed_name ] [ property ] [ value ]`)

                const edit = args[2].toLowerCase()

                if (edit == 'author') {
                    if (!args[3]) return msg.channel.send(`You must give me the value you want to put. Or maybe you are executing the command the wrong way, right way:
>  ${this.prefix}embed edit [ embed_name ] author [ text | < Image link > ]`)
                    const parts = args.slice(3).join(' ').split(' | ')
                    if (args[3].toLowerCase() !== 'null') {
                        if (parts.length === 1) {
                            embed_DB.author_text = parts[0]
                            embed_DB.author_image = ''
                        } else if (parts.length === 2) {
                            if (!exceptions.includes(parts[1])) {
                                if (
                                    !(await isImageURL(parts[1]))
                                ) return msg.channel.send(`You must give me the URL of a valid image or gif. Or maybe you are executing the command the wrong way, right way:
>  ${this.prefix}embed edit [ embed_name ] author [ text | < Image link > ]`)
                            }
                            embed_DB.author_text = parts[0]
                            embed_DB.author_image = parts[1]
                        } else {
                            return msg.channel.send(`I think you were wrong. Try again, correct way:
>  ${this.prefix}embed edit [ embed_name ] author [ text | < Image link > ]`)
                        }
                    } else {
                        embed_DB.author_text = ''
                        embed_DB.author_image = ''
                    }
                }
                else if (edit === 'title') {
                    if (!args[3]) return msg.channel.send(`You must give me the value you want to put. Or maybe you are executing the command the wrong way, right way:
>  ${this.prefix}embed edit [ embed_name ] title [ text ]`)
                    if (args[3].toLowerCase() !== 'null') {
                        embed_DB.title = args.slice(3).join(' ')
                    } else {
                        embed_DB.title = ''
                    }
                }
                else if (edit === 'description') {
                    if (!args[3]) return msg.channel.send(`You must give me the value you want to put. Or maybe you are executing the command the wrong way, right way:
>  ${this.prefix}embed edit [ embed_name ] description [ text ]`)
                    if (args[3].toLowerCase() !== 'null') {
                        embed_DB.description = args.slice(3).join(' ')
                    } else {
                        embed_DB.description = ''
                    }
                }
                else if (edit == 'thumbnail') {
                    if (!args[3]) return msg.channel.send(`You must give me the value you want to put. Or maybe you are executing the command the wrong way, right way:
>  ${this.prefix}embed edit [ embed_name ] thumbnail [ Image link ]`)
                    if (args[3].toLowerCase() !== 'null') {
                        if (!exceptions.includes(args[3])) {
                            if (
                                !(await isImageURL(args[3]))
                            ) return msg.channel.send(`You must give me the URL of a valid image or gif. Or maybe you are executing the command the wrong way, right way:
>  ${this.prefix}embed edit [ embed_name ] thumbnail [ Image link ]`)
                        }
                        embed_DB.thumbnail = args[3]
                    } else {
                        embed_DB.thumbnail = ''
                    }
                }
                else if (edit == 'image') {
                    if (!args[3]) return msg.channel.send(`You must give me the value you want to put. Or maybe you are executing the command the wrong way, right way:
>  ${this.prefix}embed edit [ embed_name ] image [ Image link ]`)
                    if (args[3].toLowerCase() !== 'null') {
                        if (!exceptions.includes(args[3])) {
                            if (
                                !(await isImageURL(args[3]))
                            ) return msg.channel.send(`You must give me the URL of a valid image or gif. Or maybe you are executing the command the wrong way, right way:
>  ${this.prefix}embed edit [ embed_name ] image [ Image link ]`)
                        }
                        embed_DB.image = args[3]
                    } else {
                        embed_DB.image = ''
                    }
                }
                else if (edit == 'footer') {
                    if (!args[3]) return msg.channel.send(`You must give me the value you want to put. Or maybe you are executing the command the wrong way, right way:
>  ${this.prefix}embed edit [ embed_name ] footer [ text | < Image link > ]`)
                    const parts = args.slice(3).join(' ').split(' | ')
                    if (args[3].toLowerCase() !== 'null') {
                        if (parts.length === 1) {
                            embed_DB.footer_text = parts[0]
                            embed_DB.footer_image = ''
                        } else if (parts.length === 2) {
                            if (!exceptions.includes(parts[1])) {
                                if (
                                    !(await isImageURL(parts[1]))
                                ) return msg.channel.send(`You must give me the URL of a valid image or gif. Or maybe you are executing the command the wrong way, right way:
>  ${this.prefix}embed edit [ embed_name ] footer [ text | < Image link > ]`)
                            }
                            embed_DB.footer_text = parts[0]
                            embed_DB.footer_image = parts[1]
                        } else {
                            return msg.channel.send(`I think you were wrong. Try again, correct way:
>  ${this.prefix}embed edit [ embed_name ] author [ text | < Image link > ]`)
                        }
                    } else {
                        embed_DB.footer_text = ''
                        embed_DB.footer_image = ''
                    }
                }
                else if (edit == 'timestamp') {
                    if(!args[3]) return msg.channel.send(`You must give me the value you want to put. Or maybe you are executing the command the wrong way, right way:
>  ${this.prefix}embed edit [ embed_name ] timestamp [ yes/no ]`)
                    if (args[3] === 'yes') {
                        embed_DB.timestamp = true
                    } else if (args[3] === 'no') {
                        embed_DB.timestamp = false
                    } else {
                        return msg.channel.send(`You gave me another value.
>  ${this.prefix}embed edit [ embed_name ] timestamp [ yes/no ]`)
                    }
                }
                else if (edit == 'color') {
                    if (!args[3]) return msg.channel.send(`You must give me the value you want to put. Or maybe you are executing the command the wrong way, right way:
>  ${this.prefix}embed edit [ embed_name ] color [ Hex Code ]`)
                    if (args[3].toLowerCase() !== 'null') {
                        var isOk = /^[0-9A-F]{6}$/i.test(args[3])
                        if (isOk === false) return msg.channel.send(`You must give me a hex color without #. Or maybe you are executing the command the wrong way, right way:
>  ${this.prefix}embed edit [ embed_name ] color [ Hex Code ]`)
                        embed_DB.color = args[3]
                    } else {
                        embed_DB.color = ''
                    }
                }
                else {
                    return msg.channel.send(`La propiedad que colocas no es válida. Puedes ver la lista de propiedades con \`${this.prefix}embed properties\`.
Or maybe you are executing the command the wrong way, right way:
> \`${this.prefix}embed edit [ name ] [ property ] [ value ]`)
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

                msg.channel.send(`The ${edit} property of the ${args[1]} embed was edited correctly.
You can add the embed to welcome, goodbye or custom commands with {embed:${args[1]}}.
Here's a preview of the embed:`, embed)
                break;
            }
            case 'preview': {
                if (!args[1]) return msg.channel.send(`You didn't tell me the embed to edit. Or maybe you are executing the command wrong, right way:
> ${this.prefix}embed preview [ embed_name ]`)
                let embed_DB = await this.client.db.embed.findOne({ guildID: msg.guild.id, embed_name: args[1] }).exec()
                if (!embed_DB) return msg.channel.send(`I can't find an embed with that name. Or maybe you are executing the command wrong, right way:
> ${this.prefix}embed preview [ embed_name ]`)
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
                msg.channel.send(`**Properties of an embed**
> \`author\` - [ text | < Image link > ]
> \`thumbnail\` - [ Image link ]
> \`title\` - [ text ]
> \`description\` - [ text ]
> \`footer\` - [ text | < Image link > ]
> \`image\` - [ Image link ]
> \`color\` - [ Hex Code ]
> \`timestamp\` - [ yes/no ]`)
                break;
            }
            default:
                msg.channel.send(`What do you want to do with the embed command? If you don't know how it works and you need a tutorial, you can use: \`${this.prefix}embed\``)
                break;
        }
    }
}