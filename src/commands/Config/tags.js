const BaseCommand = require('../../Utils/BaseCommand.js');
const isImageURL = require('image-url-validator');

module.exports = class TagsCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'tag',
            aliases: ['tags'],
            description: 'Create custom commands for your server.',
            usage: (prefix) => `${prefix}tag [option: add/edit/delete/list] [tag_name] <properties>`,
            example: (prefix) => `${prefix}tag add cool (message:Yes, you're so cool!)`,
            memberGuildPermissions: ['ADMINISTRATOR'],
            botChannelPermissions: ['EMBED_LINKS'],
            category: 'Config'
        });
    }

    async run(msg, args) {
        if (!args[0]) return msg.channel.send(new Discord.MessageEmbed()
            .setColor(this.client.color)
            .addField('Correct use', `> ${this.prefix}tags [add/edit/delete] [tag_name] <properties>`)
            .setFooter(`To see the properties, use: ${this.prefix}tags properties`));
        switch (args[0].toLowerCase()) {
            case 'add': {
                const lista = await this.client.db.tags.find({ guildID: msg.guild.id }).exec();
                if (lista.length >= 10) return msg.channel.send('For now, you can only have 10 tags per server.');
                if (!args[1]) return msg.channel.send('You must put a valid name.');
                if (this.client.commands.find(c => c.name === args[1].toLowerCase() || c.aliases.includes(args[1].toLowerCase())))
                    return msg.channel.send('You can\'t create a tag with the name of a command.');
                let tag = await this.client.db.tags.findOne({ guildID: msg.guild.id, name: args[1].toLowerCase() }).exec();
                if (tag) return msg.channel.send('There\'s already a tag with that name.');
                const variables = args.slice(2).join(' ').split('{').map((s) => s.split('}')[0]);
                const variableMessage = args.slice(2).join(' ').split('(').map((s) => s.split(')')[0]);
                const options = {
                    embed: '',
                    addrole: [],
                    removerole: []
                };
                variables.forEach((variable) => {
                    // eslint-disable-next-line prefer-const
                    let [name, ...values] = variable.split(':');
                    if (!Object.keys(options).concat('addRole', 'removeRole').includes(name)) return;
                    if (name === 'addRole') name = 'addrole';
                    if (name === 'removeRole') name = 'removerole';
                    if (['addrole', 'removerole'].includes(name)) options[name] = values.map((r) => msg.guild.roles.resolve(r));
                    else options[name] = !values[1] && values[0] ? values[0] : values;
                });
                options.image = '';
                options.message = '';
                variableMessage.forEach((variable) => {
                    const [name, ...value] = variable.split(':');
                    if (name === 'image') options.image = value.join(':');
                    else if (name === 'message') options.message = value.join(':');
                });
                if (!options.message && !options.embed && !options.image) return msg.channel.send('You must put a message, embed or image to send or all three');
                if (options.image)
                    if (!(await isImageURL(options.image))) return msg.channel.send('You must put a valid image.');
                if (options.embed) {
                    const checkear = await this.client.db.embed.findOne({ guildID: msg.guild.id, embed_name: options.embed }).exec();
                    if (!checkear) return msg.channel.send('There\'s no an embed with that name.');
                }
                if ((options.addrole.length > 0 || options.removerole.length > 0) && !msg.guild.me.permissions.has('MANAGE_ROLES')) return msg.channel.send('I don\'t have enough permissions to add or remove roles.');
                if (options.addrole.some(r => !r || !r.editable)) return msg.channel.send('The specified role doesn\'t exists or I can\'t add it.');
                if (options.removerole.some(r => !r || !r.editable)) return msg.channel.send('The specified role doesn\'t exists or I can\'t remove it.');
                tag = new this.client.db.tags({
                    guildID: msg.guild.id,
                    name: args[1].toLowerCase(),
                    removeRoleID: options.removerole.map((r) => r.id),
                    addRoleID: options.addrole.map((r) => r.id),
                    embed_name: options.embed,
                    message: options.message,
                    image: options.image
                });
                tag.save();
                msg.channel.send(`Tag with the name **${args[1].toLowerCase()}** created successfully.`);
                break;
            }
            case 'edit': {
                if (!args[1]) return msg.channel.send('You must put a valid name.');
                const tag = await this.client.db.tags.findOne({ guildID: msg.guild.id, name: args[1].toLowerCase() }).exec();
                if (!tag) return msg.channel.send('There\'s no a tag with that name.');
                const variables = args.slice(2).join(' ').split('{').map((s) => s.split('}')[0]);
                const variableMessage = args.slice(2).join(' ').split('(').map((s) => s.split(')')[0]);
                const options = {
                    embed: '',
                    addrole: [],
                    removerole: []
                };
                variables.forEach((variable) => {
                    // eslint-disable-next-line prefer-const
                    let [name, ...values] = variable.split(':');
                    if (!Object.keys(options).concat('addRole', 'removeRole').includes(name)) return;
                    if (name === 'addRole') name = 'addrole';
                    if (name === 'removeRole') name = 'removerole';
                    if (['addrole', 'removerole'].includes(name)) options[name] = values.map((r) => msg.guild.roles.resolve(r));
                    else options[name] = !values[1] && values[0] ? values[0] : values;
                });
                options.image = '';
                options.message = '';
                variableMessage.forEach((variable) => {
                    const [name, ...value] = variable.split(':');
                    if (name === 'image') options.image = value.join(':');
                    else if (name === 'message') options.message = value.join(':');
                });
                if (!options.message && !options.embed && !options.image) return msg.channel.send('You must put a message, embed or image to send or all three.');
                if (options.image)
                    if (!(await isImageURL(options.image))) return msg.channel.send('You must put a valid image.');
                if (options.embed) {
                    const checkear = await this.client.db.embed.findOne({ guildID: msg.guild.id, embed_name: options.embed }).exec();
                    if (!checkear) return msg.channel.send('There\'s no a embed with that name.');
                }
                if ((options.addrole.length > 0 || options.removerole.length > 0) && !msg.guild.me.permissions.has('MANAGE_ROLES')) return msg.channel.send('I don\'t have enough permissions to add or remove roles.');
                if (options.addrole.some(r => !r || !r.editable)) return msg.channel.send('The role doesn\'t exists or I can\'t add it.');
                if (options.removerole.some(r => !r || !r.editable)) return msg.channel.send('The role doesn\'t exists or I can\'t remove it');
                tag.deleteRoleID = options.removerole.map((r) => r.id);
                tag.addRoleID = options.addrole.map((r) => r.id);
                tag.embed_name = options.embed;
                tag.message = options.message;
                tag.image = options.image;
                tag.save();
                return msg.channel.send(`Tag with the name **${args[1].toLowerCase()}** edited successfully.`);
            }
            case 'delete': {
                if (!args[1]) return msg.channel.send('You must put an valid name.');
                const tag = await this.client.db.tags.findOneAndDelete({ guildID: msg.guild.id, name: args[1].toLowerCase() }).exec();
                if (!tag) return msg.channel.send('There\'s no a tag with that name.');
                return msg.channel.send(`Tag with the name **${args[1].toLowerCase()}** deleted successfully.`);
            }
            case 'list': {
                const lista = await this.client.db.tags.find({ guildID: msg.guild.id }).exec();
                const embed = new Discord.MessageEmbed()
                    .setColor(this.client.color);
                if (!lista.length)
                    return msg.channel.send(embed.setDescription('> The server doesn\'t has any tag (custom command).'));
                return msg.channel.send(embed.setAuthor('Server tag list', msg.guild.icon ? msg.guild.iconURL({ dynamic: true }) : null)
                    .setDescription(lista.map((t, i) => `**${i + 1}**. ${t.name}`).join('\n')));
            }
            case 'propiedades':
            case 'properties':
                return msg.channel.send(`**Properties of a tag**:
> \`(message:[text])\` - The normal text of the message to send.
> \`(image:[url])\` - Send an image as attachment.
> \`{embed:[embed_name]}\` - Send an embed already created (embed command).
> \`{addRole:[roleID]}\` - Adds a role (put another *:roleID* to add one more role).
> \`{removeRole:[roleID]}\` - Removes a role (put another *:roleID* to remove one more role).`);
            default:
                return msg.channel.send(new Discord.MessageEmbed()
                    .addField('Correct use', `> ${this.prefix}tags [add/edit/delete/list] [tag_name] <properties>`)
                    .setFooter(`To see the properties, use: ${this.prefix}tags properties`));
        }
    }
};