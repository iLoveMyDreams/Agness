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
        const helpEmbed = new Discord.MessageEmbed()
            .setColor(this.client.color)
            .setDescription(`You must put a valid property.
> \`${this.prefix}leave channel [#channel]\`
> \`${this.prefix}leave message [<text>| {embed[embed name]}]\`

To insert messages into a leave, there are three options:
- Message and embed:
> \`${this.prefix}leave message {user.tag} left the server! | {embed:[embed name]}\`
- Message only:
> \`${this.prefix}leave message {user.tag} left the server!\`
- Or just the embed:
> \`${this.prefix}leave message {embed:[embed name]}\`

To see the current settings use:
> \`${this.prefix}leave config\`

If you need to delete any property use:
> \`${this.prefix}leave [property] null\``)
            .setFooter('<> Optional | [] Required');
        if (!args[0]) return msg.channel.send(helpEmbed);
        switch (args[0].toLowerCase()) {
            case 'channel': {
                if (!args[1]) return msg.channel.send('You must put the ID of a channel or mention it.');
                if (args[1].toLowerCase() === 'null') {
                    let server = await this.client.db.leave.findOne({ guildID: msg.guild.id });
                    if (!server) server = new this.client.db.leave({ guildID: msg.guild.id, channelID: '' });
                    server.channelID = '';
                    await server.save();
                    return msg.channel.send('The channel was successfully removed from the leave.');
                }
                const matchChannel = args[1] ? args[1].match(/^<#(\d+)>$/) : false;
                const canal = matchChannel ? msg.guild.channels.resolve(matchChannel[1]) : msg.guild.channels.resolve(args[1]);
                if (!canal || canal.type !== 'text') return msg.channel.send('I didn\'t find a channel or the mentioned channel isn\'t of text.');
                if (!['SEND_MESSAGES', 'EMBED_LINKS'].some((p) => canal.permissionsFor(msg.guild.me).has(p))) return msg.channel.send('I can\'t send messages or embeds in that channel.');
                let server = await this.client.db.leave.findOne({ guildID: msg.guild.id });
                if (!server) server = new this.client.db.leave({ guildID: msg.guild.id, channelID: canal.id });
                server.channelID = canal.id;
                await server.save();
                return msg.channel.send(`> The leaves channel is now ${canal}.`);
            }
            case 'message': {
                if (!args[1]) return msg.channel.send('You must put a leave message.');
                if (args[1].toLowerCase() === 'null') {
                    let server = await this.client.db.leave.findOne({ guildID: msg.guild.id });
                    if (!server) server = new this.client.db.leave({ guildID: msg.guild.id });
                    server.embed_name = '';
                    server.message = '';
                    await server.save();
                    return msg.channel.send('The message was successfully deleted.');
                }
                if (/{embed:.+}/gi.test(args[1])) {
                    const embed = args[1].match(/{embed:.+}/gi)[0].split(':')[1].slice(0, -1);
                    if (embed) {
                        const createdEmbed = await this.client.db.embed.findOne({ guildID: msg.guild.id, embed_name: embed });
                        if (!createdEmbed) return msg.channel.send('There\'s no embed with that name.');
                    }
                    let server = await this.client.db.leave.findOne({ guildID: msg.guild.id });
                    if (!server) server = new this.client.db.leave({ guildID: msg.guild.id, embed_name: embed });
                    server.embed_name = embed;
                    server.message = '';
                    await server.save();
                    return this.sendEmbed(msg, `The new embed to use in the leaves is now **${embed}**. To test it use: \`${this.prefix}test leave\``);
                } else {
                    // eslint-disable-next-line prefer-const
                    let [message, embed] = args.slice(1).join(' ').split(' | ').map((m) => m.trim());
                    if (/{embed:.+}/gi.test(embed)) {
                        embed = embed.split(':')[1].slice(0, -1);
                        const createdEmbed = await this.client.db.embed.findOne({ guildID: msg.guild.id, embed_name: embed });
                        if (!createdEmbed) return msg.channel.send('There\'s no embed with that name.');
                    }
                    let server = await this.client.db.leave.findOne({ guildID: msg.guild.id });
                    if (!server) server = new this.client.db.leave({ guildID: msg.guild.id, embed_name: embed ? embed : '', message });
                    server.embed_name = embed ? embed : '';
                    server.message = message;
                    await server.save();
                    return this.sendEmbed(msg, `The message ${embed ? 'and embed ' : ''}of leaves has been updated correctly. To test it use: \`${this.prefix}test leave\``);
                }
            }
            case 'configuration':
            case 'settings':
            case 'config': {
                let server = await this.client.db.leave.findOne({ guildID: msg.guild.id });
                if (!server) server = new this.client.db.leave({ guildID: msg.guild.id });
                await server.save();
                const configEmbed = new Discord.MessageEmbed()
                    .setTitle('Server Leave Configuration')
                    .setDescription(`**Channel:** ${server.channelID ? `<#${server.channelID}>` : 'Doesn\'t have.'}
**Embed Name:** ${server.embed_name ? server.embed_name : 'Doesn\'t have.'}`)
                    .setColor(this.client.color)
                    .addField('Message:', `${server.message ? server.message.length > 1024 ? `${server.message.substring(0, 1000)}. And more..` : server.message : 'Does not have.'}`);
                if (server.embed_name)
                    configEmbed.setFooter(`If you want to preview the embed use: ${this.prefix}embed preview ${server.embed_name}`);
                return msg.channel.send(configEmbed);
            }
            default:
                return msg.channel.send(helpEmbed);
        }
    }
};