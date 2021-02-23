const BaseCommand = require('../../Utils/BaseCommand.js');
const isImageURL = require('image-url-validator');

module.exports = class TagsCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'tag',
            aliases: ['tags'],
            description: 'Create custom commands for your server.',
            usage: (prefix) => `${prefix}tag [option: add/edit/delete/list] [name] <properties>`,
            example: (prefix) => `${prefix}tag add cool (message:Yes, you're so cool!)`,
            memberGuildPermissions: ['ADMINISTRATOR'],
            botChannelPermissions: ['EMBED_LINKS'],
            category: 'Config'
        });
    }

    async run(msg, args) {
        const helpEmbed = new Discord.MessageEmbed()
            .setColor(this.client.color)
            .setDescription(`You must put a valid option.
> \`${this.prefix}tags add [name] [properties]\`
> \`${this.prefix}tags edit [name] [properties]\`
> \`${this.prefix}tags delete [name]\`

To see all tags in the server use:
> \`${this.prefix}tags list\`

To see the properties use:
> \`${this.prefix}tags properties\`

To use a tag, use:
> \`${this.prefix}[tag name]\``);
        if (!args[0]) return msg.channel.send(helpEmbed);
        switch (args[0].toLowerCase()) {
            case 'add': {
                const tags = await this.client.db.tags.find({ guildID: msg.guild.id });
                if (tags.length >= 10) return msg.channel.send('For now, you can only have **10** tags per server.');
                if (!args[1]) return msg.channel.send('You must put a valid name.');
                if (this.client.commands.find(c => c.name === args[1].toLowerCase() || c.aliases.includes(args[1].toLowerCase()))) return msg.channel.send('You can\'t create a tag with the name of a command.');
                let tag = await this.client.db.tags.findOne({ guildID: msg.guild.id, name: args[1].toLowerCase() });
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
                    const checkear = await this.client.db.embed.findOne({ guildID: msg.guild.id, embed_name: options.embed });
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
                await tag.save();
                return msg.channel.send(`Tag with the name **${args[1].toLowerCase()}** created successfully.`);
            }
            case 'edit': {
                if (!args[1]) return msg.channel.send('You must put a valid name.');
                const tag = await this.client.db.tags.findOne({ guildID: msg.guild.id, name: args[1].toLowerCase() });
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
                    const checkear = await this.client.db.embed.findOne({ guildID: msg.guild.id, embed_name: options.embed });
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
                await tag.save();
                return msg.channel.send(`Tag with the name **${args[1].toLowerCase()}** edited successfully.`);
            }
            case 'remove':
            case 'delete': {
                if (!args[1]) return msg.channel.send('You must put an valid name.');
                const tag = await this.client.db.tags.findOneAndDelete({ guildID: msg.guild.id, name: args[1].toLowerCase() });
                if (!tag) return msg.channel.send('There\'s no a tag with that name.');
                return msg.channel.send(`Tag with the name **${args[1].toLowerCase()}** deleted successfully.`);
            }
            case 'list': {
                const tags = await this.client.db.tags.find({ guildID: msg.guild.id });
                if (!tags.length)
                    return msg.channel.send('The server doesn\'t has any tag (custom command).');
                return msg.channel.send(new Discord.MessageEmbed()
                    .setColor(this.client.color)
                    .setAuthor('Server tag list', msg.guild.iconURL({ dynamic: true }))
                    .setDescription(tags.map((t, i) => `**${i + 1}**. ${t.name}`).join('\n')));
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
                return msg.channel.send(helpEmbed);
        }
    }
};