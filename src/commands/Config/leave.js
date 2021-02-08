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
            memberGuildPermissions: ['ADMINISTRATOR']
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
> \`${this.prefix}leave message {embed:[embed name]}\``)
            .setFooter('<> Optional | [] Required'));
        switch (args[0].toLowerCase()) {
            case 'channel': {
                if (!args[1]) return msg.channel.send('> Give me the ID or mention of the channel.');
                const matchChannel = args[1] ? args[1].match(/^<#(\d+)>$/) : false;
                let canal = matchChannel ? msg.guild.channels.resolve(matchChannel[1]) : msg.guild.channels.resolve(args[1]);
                if (!canal || canal.type !== 'text') return msg.channel.send('> I didn\'t find a channel of the mentioned channel is not of text.');
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
                if (/{embed:.+}/gi.test(args[1])) {
                    let embed = args[1].match(/{embed:.+}/gi)[0].split(':')[1].slice(0, -1);
                    if (embed) {
                        let checkear = await this.client.db.embed.findOne({ guildID: msg.guild.id, embed_name: embed }).exec();
                        if (!checkear) return msg.channel.send('> There\'s no embed with that name.');
                    }
                    let server = await this.client.db.leave.findOne({ guildID: msg.guild.id }).exec();
                    if (!server) server = new this.client.db.leave({ guildID: msg.guild.id, embed_name: embed });
                    server.embed_name = embed;
                    server.message = '';
                    server.save();
                    msg.channel.send(`> The new embed to use in the leaves is now ${embed}.`);
                } else {
                    let [message, embed] = args.slice(1).join(' ').split(' | ').map((m) => m.trim());
                    if (embed) {
                        embed = embed.split(':')[1].slice(0, -1);
                        let checkear = await this.client.db.embed.findOne({ guildID: msg.guild.id, embed_name: embed }).exec();
                        if (!checkear) return msg.channel.send('> There\'s no embed with that name.');
                    }
                    let server = await this.client.db.leave.findOne({ guildID: msg.guild.id }).exec();
                    if (!server) server = new this.client.db.leave({ guildID: msg.guild.id, embed_name: embed ? embed : '', message });
                    server.embed_name = embed ? embed : '';
                    server.message = message;
                    server.save();
                    msg.channel.send(`> The message ${embed ? 'and embed ' : ''}of leaves has been updated.`);
                }
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
> \`${this.prefix}leave message {embed:[embed name]}\``)
                    .setFooter('<> Optional | [] Required'));
                break;
        }
    }
};