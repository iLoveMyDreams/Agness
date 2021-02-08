const BaseCommand = require('../../Utils/BaseCommand.js');
const isImageURL = require('image-url-validator');

module.exports = class EmbedCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'embed',
            aliases: ['eb', 'emb'],
            description: 'Create custom embeds for your tags, welcomes and farewells. You put the design!',
            usage: (prefix) => `${prefix}embed [option: create/edit/preview/delete/list] <Embed Name> <Property> <Value>`,
            example: (prefix) => `${prefix}embed create welcome`,
            category: 'Config',
            memberGuildPermissions: ['ADMINISTRATOR'],
            botChannelPermissions: ['EMBED_LINKS']
        });
    }

    async run(msg, args) {
        let exceptions = ['{user.avatar}', '{server.icon}', '{server.owner.avatar}'];
        if (!args[0]) {
            const embed = new Discord.MessageEmbed()
                .setTitle('Why do I need an embed?')
                .setDescription('You may need it to make your server look much better aesthetically, since it will allow you to create rich text, which you can put in your welcomes, leaves and custom commands. Creativity is up to you!')
                .addField('1. Create and name your embed.', `__First of all you should not include [] or <> in the command__
The name will allow us to identify your embed so that everything looks more orderly when it comes to putting it in welcomes, leaves and custom commands. How? Well, adding \`{embed:[embed_name]}\` and Replacing \`embed_name\` with the name of your embed. For this, you can create it and give it the name you like, just like this:
> \`${this.prefix} embed create [embed_name]\``)
                .addField('2. Editing our embed', `Well, it's time to edit it the way you like, your creativity matters! Here I show you the properties of an embed:
> \`author\` - [text | <Image link>]
> \`thumbnail\` - [Image link]
> \`title\` - [text]
> \`description\` - [text]
> \`footer\` - [text | <Image link>]
> \`image\` - [Image link]
> \`color\` - [Hex Code]
> \`timestamp\` - [yes/no]
The way of use is intuitive with which it will be easier for you to learn each property. Well, without more, the embed editing mode, and it's as follows:
> \`${this.prefix}embed edit [name] [property] [value]\``)
                .addField('**EXAMPLE**', `Now, let's look at a small example with some properties, which will allow you to familiarize yourself with the simple format.
We start by creating an embed which we will call \`example\`.
> \`${this.prefix}embed create example\`
Now, to give it an attractive title
> \`${this.prefix}embed edit example title I am learning how to edit an embed.\`
Well, now let's put a description on it.
> \`${this.prefix}embed edit example description This description looks very cute\`
Let's put an image on it and we will have a simple embed, be careful and put links that really contain images. In this case we will put a funny gif.
> \`${this.prefix}embed edit example image https://i.imgur.com/mXOijAT.gif\`
Finally, let's put a color which has to be in hexadecimal code without the #, if you don't know them, you can see the colors [here](https://htmlcolorcodes.com/es/).
> \`${this.prefix}embed edit example color e658ff\`
Ready, this is a simple embed that if you want you can test yourself with:
> \`${this.prefix}embed preview example
Remember that in any case you would use: {embed:[embed name]}
> In this case: \`{embed:example}\`
To insert it in a welcome or leave, there are three options:
- Message and embed:
> \`${this.prefix}welcome message Welcome user! | {embed:example}
- Message only:
> \`${this.prefix}welcome message Welcome user!
- Or just the embed:
> \`${this.prefix}welcome message {embed:example}`)
                .addField('**VARIABLES**', `First of all, what are variables? Well, for that I am, the variables will allow us to do "automated" things so that they can be replaced by names, channels, links and others, they can be used in embeds as well as in text, for welcomes, leaves and custom commands. Here are some:
\`{user}\` - @Mention (e.j. @Aviii.#0721 *she's so beautiful <3*)
\`{server}\` - Server name (e.j. ${this.client.user.username}'s Support)
You can find the full list with \`${this.prefix}variables\``)
                .setColor(this.client.color)
                .setTimestamp()
                .setFooter('<> Optional | [] Required')
                .setImage('https://i.imgur.com/82VeGB9.png');
            return msg.channel.send(embed);
        }
        const replaceText = (text) => this.client.replaceText(text, { channel: msg.channel, member: msg.member, prefix: this.prefix });
        switch (args[0].toLowerCase()) {
            case 'create': {
                const lista = await this.client.db.embed.find({ guildID: msg.guild.id }).exec();
                if (lista.length >= 10) return msg.channel.send('For now, you can only have 10 embeds per server.');
                if (!args[1]) return msg.channel.send(`You didn't put the name of the embed to create.
> ${this.prefix}embed create [embed_name]`);
                let checkear = await this.client.db.embed.findOne({ guildID: msg.guild.id, embed_name: args[1] }).exec();
                if (checkear) return msg.channel.send('There\'s already an embed with that name. Try another.');
                let nuevo = new this.client.db.embed({ guildID: msg.guild.id, embed_name: args[1] });
                await nuevo.save();
                msg.channel.send(`Embed created successfully. Now you can edit it with:
> ${this.prefix}embed edit [name] [property] [value]`);
                break;
            }
            case 'delete': {
                if (!args[1]) return msg.channel.send(`You didn't put the name of the embed that I should delete.
> ${this.prefix}embed delete [embed_name]`);
                let checkear = await this.client.db.embed.findOneAndDelete({ guildID: msg.guild.id, embed_name: args[1] }).exec();
                if (!checkear) return msg.channel.send('There\'s no embed with that name.');
                msg.channel.send('Embed removed successfully.');
                break;
            }
            case 'list': {
                const lista = await this.client.db.embed.find({ guildID: msg.guild.id }).exec();
                const embed = new Discord.MessageEmbed()
                    .setColor(this.client.color);
                if (!lista.length)
                    return msg.channel.send(embed.setDescription('The server doesn\'t have any embed.'));
                msg.channel.send(embed.setAuthor(`Embed list of ${msg.guild.name}`, msg.guild.icon ? msg.guild.iconURL({ dynamic: true }) : null)
                    .setDescription(lista.map((e, i) => `**${i + 1}**. ${e.embed_name}`).join('\n')));
                break;
            }
            case 'edit': {
                if (!args[1]) return msg.channel.send(`You didn't tell me the embed to edit. Or maybe you are executing the command wrong, right way:
> ${this.prefix}embed edit [embed_name] [property] [value]`);
                let embed_DB = await this.client.db.embed.findOne({ guildID: msg.guild.id, embed_name: args[1] }).exec();
                if (!embed_DB) return msg.channel.send(`I can't find an embed with that name. Or maybe you are executing the command wrong, right way:
> ${this.prefix}embed edit [embed_name] [property] [value]`);
                if (!args[2]) return msg.channel.send(`You didn't tell me the property to edit. Or maybe you are executing the command wrong, right way:
> ${this.prefix}embed edit [embed_name] [property] [value]`);

                const edit = args[2].toLowerCase();

                switch (edit) {
                    case 'footer':
                    case 'author': {
                        if (!args[3]) return msg.channel.send(`You must give me the value you want to put. Or maybe you are executing the command the wrong way, right way:
>  ${this.prefix}embed edit [embed_name] ${edit} [text | <Image link>]`);
                        const parts = args.slice(3).join(' ').split(' | ');
                        if (edit === 'footer' && parts[0].length > 2048) return msg.channel.send('The footer must have 2048 characters or less.');
                        if (edit === 'author' && parts[0].length > 256) return msg.channel.send('The author must have 256 characters or less.');
                        if (args[3].toLowerCase() !== 'null') {
                            if (parts.length === 1) {
                                embed_DB[`${edit}_text`] = parts[0];
                                embed_DB[`${edit}_image`] = '';
                            } else if (parts.length === 2) {
                                if (!exceptions.includes(parts[1]))
                                    if (!(await isImageURL(parts[1]))) return msg.channel.send(`You must give me the URL of a valid image or gif. Or maybe you are executing the command the wrong way, right way:
>  ${this.prefix}embed edit [embed_name] ${edit} [text | <Image link>]`);
                                embed_DB[`${edit}_text`] = parts[0];
                                embed_DB[`${edit}_image`] = parts[1];
                            } else {
                                return msg.channel.send(`I think you were wrong. Try again, correct way:
>  ${this.prefix}embed edit [embed_name] ${edit} [text | <Image link>]`);
                            }
                        } else {
                            embed_DB[`${edit}_text`] = '';
                            embed_DB[`${edit}_image`] = '';
                        }
                        break;
                    }
                    case 'title':
                    case 'description': {
                        if (!args[3]) return msg.channel.send(`You must give me the value you want to put. Or maybe you are executing the command the wrong way, right way:
>  ${this.prefix}embed edit [embed_name] ${edit} [text]`);
                        if (edit === 'title' && args.slice(3).join(' ').length > 256) return msg.channel.send('The title must have 256 characters or less.');
                        if (args[3].toLowerCase() !== 'null')
                            embed_DB[edit] = args.slice(3).join(' ');
                        else embed_DB[edit] = '';
                        break;
                    }
                    case 'image':
                    case 'thumbnail': {
                        if (!args[3]) return msg.channel.send(`You must give me the value you want to put. Or maybe you are executing the command the wrong way, right way:
>  ${this.prefix}embed edit [embed_name] ${edit} [Image link]`);
                        if (args[3].toLowerCase() !== 'null') {
                            if (!exceptions.includes(args[3]))
                                if (!(await isImageURL(args[3]))) return msg.channel.send(`You must give me the URL of a valid image. Or maybe you are executing the command the wrong way, right way:
>  ${this.prefix}embed edit [embed_name] ${edit} [Image link]`);
                            embed_DB[edit] = args[3];
                        } else
                            embed_DB[edit] = '';
                        break;
                    }
                    case 'timestamp': {
                        if (!args[3]) return msg.channel.send(`You must give me the value you want to put. Or maybe you are executing the command the wrong way, right way:
>  ${this.prefix}embed edit [embed_name] timestamp [yes/no]`);
                        if (args[3] === 'yes')
                            embed_DB.timestamp = true;
                        else if (args[3] === 'no')
                            embed_DB.timestamp = false;
                        else return msg.channel.send(`You gave me another value.
>  ${this.prefix}embed edit [embed_name] timestamp [yes/no]`);
                        break;
                    }
                    case 'color': {
                        if (!args[3]) return msg.channel.send(`You must give me the value you want to put. Or maybe you are executing the command the wrong way, right way:
>  ${this.prefix}embed edit [embed_name] color [Hex Code]`);
                        if (args[3].toLowerCase() !== 'null') {
                            var isOk = /^[0-9A-F]{6}$/i.test(args[3]);
                            if (isOk === false) return msg.channel.send(`You must give me a hex color without #. Or maybe you are executing the command the wrong way, right way:
>  ${this.prefix}embed edit [embed_name] color [Hex Code]`);
                            embed_DB.color = args[3];
                        } else embed_DB.color = '';
                        break;
                    }
                    default:
                        return msg.channel.send(`The property that you put isn't valid. You can see the list of the properties with \`${this.prefix}embed properties\`.
Or maybe you are executing the command the wrong way, right way:
> \`${this.prefix}embed edit [name] [property] [value]`);
                }

                embed_DB.save();

                msg.channel.send(`The ${edit} property of the ${args[1]} embed was edited correctly.
You can add the embed to welcome, goodbye or custom commands with {embed:${args[1]}}.
Here's a preview of the embed:`, await this.client.generateEmbed(embed_DB, replaceText));
                break;
            }
            case 'preview': {
                if (!args[1]) return msg.channel.send(`You didn't tell me the embed to edit. Or maybe you are executing this command wrong, right way:
> ${this.prefix}embed preview [embed_name]`);
                let embed_DB = await this.client.db.embed.findOne({ guildID: msg.guild.id, embed_name: args[1] }).exec();
                if (!embed_DB) return msg.channel.send(`I can't find an embed with that name. Or maybe you are executing the command wrong, right way:
> ${this.prefix}embed preview [embed_name]`);
                msg.channel.send(await this.client.generateEmbed(embed_DB, replaceText));
                break;
            }
            case 'propiedades':
            case 'properties': {
							const embed = new Discord.MessageEmbed()
                .setDescription(`**Properties of an embed**
> \`author\` - [text | <Image link>]
> \`thumbnail\` - [Image link]
> \`title\` - [text]
> \`description\` - [text]
> \`footer\` - [text | <Image link>]
> \`image\` - [Image link]
> \`color\` - [Hex Code]
> \`timestamp\` - [enabled: yes/no]`)
							.setFooter('<> Optional | [] Required')
							.setColor(this.client.color)
							.setTimestamp();
							msg.channel.send(embed);
                break;
            }
            default:
                msg.channel.send(`What do you want to do with the embed command? If you don't know how it works and you need a tutorial, you can use: \`${this.prefix}embed\`.`);
                break;
        }
    }
};