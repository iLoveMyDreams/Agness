const BaseCommand = require('../../Utils/BaseCommand.js');
const isImageURL = require('image-url-validator');

module.exports = class EmbedCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'embed',
            aliases: ['eb', 'emb'],
            description: 'Create custom embeds for your tags, welcomes and leaves. You put the design!',
            usage: (prefix) => `${prefix}embed [option: create/edit/preview/delete/list] <Embed Name> <Property> <Value>`,
            example: (prefix) => `${prefix}embed create welcome`,
            category: 'Config',
            memberGuildPermissions: ['ADMINISTRATOR'],
            botChannelPermissions: ['EMBED_LINKS']
        });

        this.exceptions = ['{user.avatar}', '{server.icon}', '{server.owner.avatar}'];
        this.helpEmbed = () => new Discord.MessageEmbed()
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
> \`${this.prefix}embed preview example`)
            .addField('Send it for welcomes/leaves', `Remember that in any case you would use: {embed:[embed name]}
> In this case: \`{embed:example}\`
To insert it in a welcome or leave, there are three options:
- Message and embed:
> \`${this.prefix}welcome message Welcome user! | {embed:example}\`
- Message only:
> \`${this.prefix}welcome message Welcome user!\`
- Or just the embed:
> \`${this.prefix}welcome message {embed:example}\``)
            .addField('**VARIABLES**', `First of all, what are variables? Well, for that I am, the variables will allow us to do "automated" things so that they can be replaced by names, channels, links and others, they can be used in embeds as well as in text, for welcomes, leaves and custom commands. Here are some:
\`{user}\` - @Mention (e.j. @Aviii.#0721 *she's so beautiful <3*)
\`{server}\` - Server name (e.j. ${this.client.user.username}'s Support)
You can find the full list with \`${this.prefix}variables\``)
            .setColor(this.client.color)
            .setTimestamp()
            .setFooter('<> Optional | [] Required')
            .setImage('https://i.ibb.co/9YBv4tQ/image.png');
    }

    async run(msg, args) {
        if (!args[0]) return msg.channel.send(this.helpEmbed());
        const replaceText = (text) => this.client.replaceText(text, { channel: msg.channel, member: msg.member, prefix: this.prefix });
        switch (args[0].toLowerCase()) {
            case 'create': {
                const lista = await this.client.db.embed.find({ guildID: msg.guild.id });
                if (lista.length >= 10) return msg.channel.send('For now, you can only have **10** embeds per server.');
                if (!args[1]) return msg.channel.send('You didn\'t put the name of the embed to create.');
                if (args[1].length > 10) return msg.channel.send('Try a shorter name, the maximum is 10 characters.');
                let embed = await this.client.db.embed.findOne({ guildID: msg.guild.id, embed_name: args[1] });
                if (embed) return msg.channel.send('There\'s already an embed with that name. Try another.');
                embed = new this.client.db.embed({ guildID: msg.guild.id, embed_name: args[1] });
                await embed.save();
                return msg.channel.send(`Embed with the name **${embed.embed_name}** created successfully`);
            }
            case 'remove':
            case 'delete': {
                if (!args[1]) return msg.channel.send('You didn\'t put the name of the embed that I should delete.');
                const embed = await this.client.db.embed.findOneAndDelete({ guildID: msg.guild.id, embed_name: args[1] });
                if (!embed) return msg.channel.send('There\'s no embed with that name.');
                return msg.channel.send(`Embed with the name **${embed.embed_name}** deleted successfully.`);
            }
            case 'list': {
                const embeds = await this.client.db.embed.find({ guildID: msg.guild.id });
                if (!embeds.length) return msg.channel.send('The server doesn\'t have any embed.');
                return msg.channel.send(new Discord.MessageEmbed()
                    .setColor(this.client.color)
                    .setAuthor('Server embeds', msg.guild.iconURL({ dynamic: true }))
                    .setDescription(embeds.map((e, i) => `**${i + 1}**. ${e.embed_name}`).join('\n')));
            }
            case 'edit': {
                if (!args[1]) return msg.channel.send('You didn\'t tell me the embed to edit.');
                const embed = await this.client.db.embed.findOne({ guildID: msg.guild.id, embed_name: args[1] });
                if (!embed) return msg.channel.send('I can\'t find an embed with that name.');
                if (!args[2]) return msg.channel.send('You didn\'t tell me the property to edit.');
                const edit = args[2].toLowerCase();

                switch (edit) {
                    case 'footer':
                    case 'author': {
                        if (!args[3]) return msg.channel.send(`You must put the text to put as ${edit}.`);
                        const parts = args.slice(3).join(' ').split(' | ');
                        if (edit === 'footer' && parts[0].length > 2048) return msg.channel.send('The footer must have 2048 characters or less.');
                        if (edit === 'author' && parts[0].length > 256) return msg.channel.send('The author must have 256 characters or less.');
                        if (args[3].toLowerCase() !== 'null') {
                            if (parts.length === 1) {
                                embed[`${edit}_text`] = parts[0];
                                embed[`${edit}_image`] = '';
                            } else {
                                if (!this.exceptions.includes(parts[1]))
                                    if (!(await isImageURL(parts[1]))) return msg.channel.send('You must give me the URL of a valid image.');
                                embed[`${edit}_text`] = parts[0];
                                embed[`${edit}_image`] = parts[1];
                            }
                        } else {
                            embed[`${edit}_text`] = '';
                            embed[`${edit}_image`] = '';
                        }
                        break;
                    }
                    case 'title':
                    case 'description': {
                        if (!args[3]) return msg.channel.send(`You must put the text to put as ${edit}.`);
                        if (edit === 'title' && args.slice(3).join(' ').length > 256) return msg.channel.send('The title must have 256 characters or less.');
                        if (args[3].toLowerCase() !== 'null')
                            embed[edit] = args.slice(3).join(' ');
                        else embed[edit] = '';
                        break;
                    }
                    case 'image':
                    case 'thumbnail': {
                        if (!args[3]) return msg.channel.send(`You must put the image to put as ${edit}.`);
                        if (args[3].toLowerCase() !== 'null') {
                            if (!this.exceptions.includes(args[3]))
                                if (!(await isImageURL(args[3]))) return msg.channel.send('You must give me the URL of a valid image.');
                            embed[edit] = args[3];
                        } else
                            embed[edit] = '';
                        break;
                    }
                    case 'timestamp': {
                        if (!args[3]) return msg.channel.send('You must specify if you want the timestamp (yes/no).');
                        if (args[3] === 'yes')
                            embed.timestamp = true;
                        else if (args[3] === 'no')
                            embed.timestamp = false;
                        else return msg.channel.send('You must put `yes` or `no` if you want a timestamp.');
                        break;
                    }
                    case 'color': {
                        if (!args[3]) return msg.channel.send('You must specify the color without #.');
                        if (args[3].toLowerCase() !== 'null') {
                            var isOk = /^[0-9A-F]{6}$/i.test(args[3]);
                            if (isOk === false) return msg.channel.send('You must specify the color without #.');
                            embed.color = args[3];
                        } else embed.color = '';
                        break;
                    }
                    default:
                        return msg.channel.send(`The property that you put isn't valid.\nYou can see the list of the properties with \`${this.prefix}embed properties\`.`);
                }

                await embed.save();
                return msg.channel.send(`The **${edit}** property of the embed **${args[1]}** was edited correctly. You can add the embed to welcome, goodbye or custom commands with {embed:${args[1]}}.
If you need to delete any property use:
> ${this.prefix}embed edit [name] [property] null

Here's a preview of the embed:`, await this.client.generateEmbed(embed, replaceText));
            }
            case 'preview': {
                if (!args[1]) return msg.channel.send('You didn\'t tell me the embed to edit.');
                const embed = await this.client.db.embed.findOne({ guildID: msg.guild.id, embed_name: args[1] });
                if (!embed) return msg.channel.send('I can\'t find an embed with that name.');
                return msg.channel.send(await this.client.generateEmbed(embed, replaceText));
            }
            case 'propiedades':
            case 'properties':
                return msg.channel.send(new Discord.MessageEmbed()
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
                    .setTimestamp());
            default:
                return msg.channel.send(this.helpEmbed());
        }
    }
};