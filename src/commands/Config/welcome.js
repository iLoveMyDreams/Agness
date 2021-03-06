const BaseCommand = require('../../Utils/BaseCommand.js');

module.exports = class WelcomeCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'welcome',
            aliases: ['setwelcome'],
            description: 'Set the channel and messages that you prefer the most when someone joins to your server c:',
            usage: (prefix) => `${prefix}welcome [option: channel/message] <Value>`,
            example: (prefix) => `${prefix}welcome channel #welcomes`,
            category: 'Config',
            memberGuildPermissions: ['ADMINISTRATOR'],
            botChannelPermissions: ['EMBED_LINKS']
        });
    }

    async run(msg, args) {
        if (!args[0]) return msg.channel.send(new Discord.MessageEmbed()
            .setColor(this.client.color)
            .setDescription(`You must put a valid property.
> \`${this.prefix}welcome channel [#channel]\`
> \`${this.prefix}welcome message [ <text> | {embed[embed name]} ]\`
> \`${this.prefix}welcome autorole [user|bot] [@role]\`

To insert messages into a welcome, there are three options:
- Message and embed:
> \`${this.prefix}welcome message Welcome {user}! | {embed:[embed name]}\`
- Message only:
> \`${this.prefix}welcome message Welcome {user}!\`
- Or just the embed:
> \`${this.prefix}welcome message {embed:[embed name]}\`

If you need to delete any property use:
> \`${this.prefix}welcome [property] null\``)
            .setFooter('<> Optional | [] Required'));
        switch (args[0].toLowerCase()) {
            case 'channel': {
                if (!args[1]) return msg.channel.send('> Give me the ID or mention of the channel.');
                if (args[1].toLowerCase() === 'null') {
                    let server = await this.client.db.welcome.findOne({ guildID: msg.guild.id });
                    if (!server) server = new this.client.db.welcome({ guildID: msg.guild.id, channelID: '' });
                    server.channelID = '';
                    server.save();
                    return msg.channel.send('The channel was successfully removed.');
                }
                const matchChannel = args[1] ? args[1].match(/^<#(\d+)>$/) : false;
                const canal = matchChannel ? msg.guild.channels.resolve(matchChannel[1]) : msg.guild.channels.resolve(args[1]);
                if (!canal || canal.type !== 'text') return msg.channel.send('> I didn\'t find a channel or the mentioned channel is not of text.');
                if (!canal.permissionsFor(msg.guild.me).has('SEND_MESSAGES')) return msg.channel.send('> I can\'t send messages in that channel.');
                let server = await this.client.db.welcome.findOne({ guildID: msg.guild.id });
                if (!server) server = new this.client.db.welcome({ guildID: msg.guild.id, channelID: canal.id });
                server.channelID = canal.id;
                server.save();
                msg.channel.send(`> The welcomes channel is now ${canal}.`);
                break;
            }
            case 'message': {
                if (!args[1]) return msg.channel.send('> You must put a welcome message.');
                if (args[1].toLowerCase() === 'null') {
                    let server = await this.client.db.welcome.findOne({ guildID: msg.guild.id });
                    if (!server) server = new this.client.db.welcome({ guildID: msg.guild.id, embed_name: '', message: '' });
                    server.embed_name = '';
                    server.message = '';
                    server.save();
                    return msg.channel.send('The message was successfully deleted.');
                }
                if (/{embed:.+}/gi.test(args[1])) {
                    const embed = args[1].match(/{embed:.+}/gi)[0].split(':')[1].slice(0, -1);
                    if (embed) {
                        const checkear = await this.client.db.embed.findOne({ guildID: msg.guild.id, embed_name: embed });
                        if (!checkear) return msg.channel.send(`> There's no embed with that name.
You can see the list of embeds with:
> \`${this.prefix}embed list\``);
                    }
                    let server = await this.client.db.welcome.findOne({ guildID: msg.guild.id });
                    if (!server) server = new this.client.db.welcome({ guildID: msg.guild.id, embed_name: embed });
                    server.embed_name = embed;
                    server.message = '';
                    server.save();
                    this.sendEmbed(msg, `The new embed to use in the welcomes is now ${embed}.
If you need to see how the messages and roles it gives would be, you can use:
> \`${this.prefix}test welcome\``);
                } else {
                    // eslint-disable-next-line prefer-const
                    let [message, embed] = args.slice(1).join(' ').split(' | ').map((m) => m.trim());
                    if (embed) {
                        try {
                            embed = embed.split(':')[1].slice(0, -1);
                            const checkear = await this.client.db.embed.findOne({ guildID: msg.guild.id, embed_name: embed });
                            if (!checkear) return msg.channel.send('> There\'s no embed with that name.');
                        } catch (e) {
                            return msg.channel.send(`The correct way to use is:
- Message and embed:
> \`${this.prefix}welcome message Welcome {user}! | {embed:[embed name]}\`
- Message only:
> \`${this.prefix}welcome message Welcome {user}!\`
- Or just the embed:
> \`${this.prefix}welcome message {embed:[embed name]}\``);
                        }
                    }
                    let server = await this.client.db.welcome.findOne({ guildID: msg.guild.id });
                    if (!server) server = new this.client.db.welcome({ guildID: msg.guild.id, embed_name: embed ? embed : '', message });
                    server.embed_name = embed ? embed : '';
                    server.message = message;
                    server.save();
                    this.sendEmbed(msg, `The message ${embed ? 'and embed ' : ''}of welcomes has been updated correctly.
If you need to see how the messages and roles it gives would be, you can use:
> \`${this.prefix}test welcome\``);
                }
                break;
            }
            case 'autorole': {
                if (!args[2]) return msg.channel.send('You must specify the ID or mention a role.');
                if (args[2].toLowerCase() === 'null') {
                    let server = await this.client.db.welcome.findOne({ guildID: msg.guild.id });
                    if (!server) server = new this.client.db.welcome({ guildID: msg.guild.id, botRoleID: '' });
                    server.userRoleID = '';
                    await server.save();
                    return msg.channel.send(`A role will not be given now when a ${args[1].toLowerCase()} joins the server.`);
                }
                const matchRole = args[2].match(/^<@&(\d+)>$/);
                const role = matchRole ? msg.guild.roles.resolve(matchRole[1]) : msg.guild.roles.resolve(args[2]);
                if (!role) return msg.channel.send('I couldn\'t find that role or it\'s invalid.');
                if (!role.editable) return msg.channel.send('I don\'t have enough permissions to give that role.');
                let server = await this.client.db.welcome.findOne({ guildID: msg.guild.id });
                if (!server) server = new this.client.db.welcome({ guildID: msg.guild.id, [`${args[1].toLowerCase()}RoleID`]: role.id });
                server[`${args[1].toLowerCase()}RoleID`] = role.id;
                server.save();
                return msg.channel.send(`Now, the role **${role.name}** will be given when a ${args[1].toLowerCase()} joins the server. To test it use: \`${this.prefix}test welcome\``);
            }
            case 'configuration':
            case 'settings':
            case 'config': {
                let server = await this.client.db.welcome.findOne({ guildID: msg.guild.id });
                if (!server) server = new this.client.db.welcome({ guildID: msg.guild.id });
                server.save();
                const configEmbed = new Discord.MessageEmbed()
                    .setTitle('Server Welcome Configuration')
                    .setDescription(`**Channel:** ${server.channelID ? `<#${server.channelID}>` : 'Does not have.'}
**User AutoRole:** ${server.userRoleID ? `<@&${server.userRoleID}>` : 'Does not have.'}
**Bot AutoRole:** ${server.botRoleID ? `<@&${server.botRoleID}>` : 'Does not have.'}
**Embed Name:** ${server.embed_name ? server.embed_name : 'Does not have.'}`)
                    .addField('Message:', `${server.message ? server.message.length > 1024 ? `${server.message.substring(0, 1000)}. And more..` : server.message : 'Does not have.'}`)
                    .setColor(this.client.color);
                if (server.embed_name)
                    configEmbed.setFooter(`If you want to see the embed use: ${this.prefix}embed preview ${server.embed_name}`);
                return msg.channel.send(configEmbed);
            }
            default:
                return msg.channel.send(new Discord.MessageEmbed()
                    .setColor(this.client.color)
                    .setDescription(`You must put a valid property.
> ${this.prefix}welcome channel [#channel]
> ${this.prefix}welcome message [ <text> | {embed[embed name]} ]
> ${this.prefix}welcome autorole [user|bot] [@role]

To insert messages into a welcome, there are three options:
- Message and embed:
> \`${this.prefix}welcome message Welcome user! | {embed:[embed name]}\`
- Message only:
> \`${this.prefix}welcome message Welcome user!\`
- Or just the embed:
> \`${this.prefix}welcome message {embed:[embed name]}\`

To see the current settings use:
> \`${this.prefix}welcome config\`

If you need to delete any property use:
> \`${this.prefix}welcome [property] null\``)
                    .setFooter('<> Optional | [] Required'));
        }
    }
};