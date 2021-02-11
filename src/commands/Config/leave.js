const BaseCommand = require('../../Utils/BaseCommand.js');

module.exports = class LeaveCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'leave',
            aliases: ['setleave'],
            description: 'Set the channel and messages that you prefer when someone leaves your server >:c',
            usage: (prefix) => `${prefix}leave [property: channel/message] <Value>`,
            example: (prefix) => `${prefix}leave channel #goodbye`,
            category: 'Config',
            memberGuildPermissions: ['ADMINISTRATOR'],
            botChannelPermissions: ['EMBED_LINKS']
        });
    }

    async run(msg, args) {
        if (!args[0]) return msg.channel.send(new Discord.MessageEmbed()
            .setColor(this.client.color)
            .setDescription(`You must put a valid property.
> \`${this.prefix}leave channel [#channel]\`
> \`${this.prefix}leave message [ <text> | {embed[embed name]} ]\`

To insert messages into a leave, there are three options:
- Message and embed:
> \`${this.prefix}leave message {user.tag} left the server! | {embed:[embed name]}\`
- Message only:
> \`${this.prefix}leave message {user.tag} left the server!\`
- Or just the embed:
> \`${this.prefix}leave message {embed:[embed name]}\`

If you need to delete any property use:
> \`${this.prefix}welcome [property] null\``)
            .setFooter('<> Optional | [] Required'));
        switch (args[0].toLowerCase()) {
            case 'channel': {
                if (!args[1]) return msg.channel.send('> Give me the ID or mention of the channel.');
                if (args[1].toLowerCase() === 'null') {
                    let server = await this.client.db.welcome.findOne({ guildID: msg.guild.id }).exec();
                    if (!server) server = new this.client.db.leave({ guildID: msg.guild.id, channelID: '' });
                    server.channelID = '';
                    server.save();
                    return msg.channel.send(`The channel was successfully removed.`);
                }
                const matchChannel = args[1] ? args[1].match(/^<#(\d+)>$/) : false;
                const canal = matchChannel ? msg.guild.channels.resolve(matchChannel[1]) : msg.guild.channels.resolve(args[1]);
                if (!canal || canal.type !== 'text') return msg.channel.send('> I didn\'t find a channel or the mentioned channel is not of text.');
                if (!['SEND_MESSAGES', 'EMBED_LINKS'].some((p) => canal.permissionsFor(msg.guild.me).has(p))) return msg.channel.send('> I can\'t send messages or embeds in that channel.');
                let server = await this.client.db.leave.findOne({ guildID: msg.guild.id }).exec();
                if (!server) server = new this.client.db.leave({ guildID: msg.guild.id, channelID: canal.id });
                server.channelID = canal.id;
                server.save();
                msg.channel.send(`> The leaves channel is now ${canal}.`);
                break;
            }
            case 'message': {
                if (!args[1]) return msg.channel.send('> You must put a leave message.');
                if (args[1].toLowerCase() === 'null') {
                    let server = await this.client.db.welcome.findOne({ guildID: msg.guild.id }).exec();
                    if (!server) server = new this.client.db.leave({ guildID: msg.guild.id, embed_name: '', message: '' });
                    server.embed_name = '';
                    server.message = '';
                    server.save();
                    return msg.channel.send(`The message was successfully deleted.`);
                }
                if (/{embed:.+}/gi.test(args[1])) {
                    const embed = args[1].match(/{embed:.+}/gi)[0].split(':')[1].slice(0, -1);
                    if (embed) {
                        const checkear = await this.client.db.embed.findOne({ guildID: msg.guild.id, embed_name: embed }).exec();
                        if (!checkear) return msg.channel.send(`> There's no embed with that name.
You can see the list of embeds with:
> \`${this.prefix}embed list\``);
                    }
                    let server = await this.client.db.leave.findOne({ guildID: msg.guild.id }).exec();
                    if (!server) server = new this.client.db.leave({ guildID: msg.guild.id, embed_name: embed });
                    server.embed_name = embed;
                    server.message = '';
                    server.save();
                    this.sendEmbed(msg, `The new embed to use in the leaves is now ${embed}.
If you need to see how the messages and roles it gives would be, you can use:
> \`${this.prefix}test welcome\``);
                } else {
                    // eslint-disable-next-line prefer-const
                    let [message, embed] = args.slice(1).join(' ').split(' | ').map((m) => m.trim());
                    if (embed) {
                        try{
                        embed = embed.split(':')[1].slice(0, -1);
                        const checkear = await this.client.db.embed.findOne({ guildID: msg.guild.id, embed_name: embed }).exec();
                        if (!checkear) return msg.channel.send('> There\'s no embed with that name.');
                        } catch (e){
                            return msg.channel.send(`The correct way to use is:
- Message and embed:
> \`${this.prefix}welcome message Welcome {user}! | {embed:[embed name]}\`
- Message only:
> \`${this.prefix}welcome message Welcome {user}!\`
- Or just the embed:
> \`${this.prefix}welcome message {embed:[embed name]}\``)
                        }
                    }
                    let server = await this.client.db.leave.findOne({ guildID: msg.guild.id }).exec();
                    if (!server) server = new this.client.db.leave({ guildID: msg.guild.id, embed_name: embed ? embed : '', message });
                    server.embed_name = embed ? embed : '';
                    server.message = message;
                    server.save();
                    this.sendEmbed(msg, `The message ${embed ? 'and embed ' : ''}of leaves has been updated correctly.
If you need to see how the messages and roles it gives would be, you can use:
> \`${this.prefix}test welcome\``);
                }
                break;
            }
            case 'config': {
                let server = await this.client.db.leave.findOne({ guildID: msg.guild.id }).exec();
                if (!server) server = new this.client.db.welcome({ guildID: msg.guild.id });
                server.save();
                const configEmbed = new Discord.MessageEmbed()
                    .setTitle(`Server Leave Configuration`)
                    .setDescription(`**Channel:** ${server.channelID ? `<#${server.channelID}>` : `Does not have.`}
**Embed Name:** ${server.embed_name ? server.embed_name : `Does not have.`}`)
                    .setColor(this.client.color)
                    .addField(`Message:`, `${server.message ? server.message.length > 1024 ? `${server.message.substring(0, 1000)}. And more..` : server.message : `Does not have.`}`)
                if (server.embed_name) configEmbed.setFooter(`If you want to see the embed use: ${this.prefix}embed preview ${server.embed_name}`)
                msg.channel.send(configEmbed)
                break;
            }
            default:
                msg.channel.send(new Discord.MessageEmbed()
                    .setColor(this.client.color)
                    .setDescription(`You must put a valid property.
> ${this.prefix}leave channel [#channel]
> ${this.prefix}leave message message [ <text> | {embed[embed name]} ]

To insert messages into a welcome, there are three options:
- Message and embed:
> \`${this.prefix}leave message Welcome user! | {embed:[embed name]}\`
- Message only:
> \`${this.prefix}leave message Welcome user!\`
- Or just the embed:
> \`${this.prefix}leave message {embed:[embed name]}\`

If you need to delete any property use:
> \`${this.prefix}welcome [property] null\``)
                    .setFooter('<> Optional | [] Required'));
                break;
        }
    }
};