const BaseCommand = require('../../Utils/BaseCommand.js');

module.exports = class WelcomeCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'welcome',
            aliases: ['setwelcome'],
            description: 'Set the channel and messages that you prefer the most when someone joins to your server c:',
            usage: (prefix) => `${prefix}welcome [option: channel/message] <Properties>`,
            example: (prefix) => `${prefix}welcome channel #welcome`,
            category: 'Config',
            memberGuildPermissions: ['ADMINISTRATOR']
        });
    }

    async run(msg, args) {
        if (!args[0]) return msg.channel.send(new Discord.MessageEmbed()
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
> \`${this.prefix}welcome message {embed:[embed name]}\``)
.setFooter('<> Optional | [] Required'));
        switch (args[0].toLowerCase()) {
            case 'channel': {
                if (!args[1]) return msg.channel.send('> Give me the ID or mention of the channel.');
                const matchChannel = args[1] ? args[1].match(/^<#(\d+)>$/) : false;
                let canal = matchChannel ? msg.guild.channels.resolve(matchChannel[1]) : msg.guild.channels.resolve(args[1]);
                if (!canal || canal.type !== 'text') return msg.channel.send('> I didn\'t find a channel of the mentioned channel is not of text.');
                if (!canal.permissionsFor(msg.guild.me).has('SEND_MESSAGES')) return msg.channel.send('> I can\'t send messages in that channel.');
                let server = await this.client.db.welcome.findOne({ guildID: msg.guild.id }).exec();
                if (!server) server = new this.client.db.welcome({ guildID: msg.guild.id, channelID: canal.id });
                server.channelID = canal.id;
                server.save();
                msg.channel.send(`> The welcomes channel is now ${canal}.`);
                break;
            }
            case 'message': {
                if (!args[1]) return msg.channel.send('> You must put a welcome message.');
                if (/{embed:.+}/gi.test(args[1])) {
                    let embed = args[1].match(/{embed:.+}/gi)[0].split(':')[1].slice(0, -1);
                    if (embed) {
                        let checkear = await this.client.db.embed.findOne({ guildID: msg.guild.id, embed_name: embed }).exec();
                        if (!checkear) return msg.channel.send('> There\'s no embed with that name.');
                    }
                    let server = await this.client.db.welcome.findOne({ guildID: msg.guild.id }).exec();
                    if (!server) server = new this.client.db.welcome({ guildID: msg.guild.id, embed_name: embed });
                    server.embed_name = embed;
                    server.message = '';
                    server.save();
                    msg.channel.send(`> The new embed to use in the welcomes is now ${embed}.`);
                } else {
                    let [message, embed] = args.slice(1).join(' ').split(' | ').map((m) => m.trim());
                    if (embed) {
                        embed = embed.split(':')[1].slice(0, -1);
                        let checkear = await this.client.db.embed.findOne({ guildID: msg.guild.id, embed_name: embed }).exec();
                        if (!checkear) return msg.channel.send('> There\'s no embed with that name.');
                    }
                    let server = await this.client.db.welcome.findOne({ guildID: msg.guild.id }).exec();
                    if (!server) server = new this.client.db.welcome({ guildID: msg.guild.id, embed_name: embed ? embed : '', message });
                    server.embed_name = embed ? embed : '';
                    server.message = message;
                    server.save();
                    msg.channel.send(`> The message ${embed ? 'and embed ' : ''}of welcomes has been updated.`);
                }
                break;
            }
            case 'autorole': {
                switch (args[1]) {
                    case 'user': {
                        let rol = msg.mentions.roles.first() || msg.guild.roles.resolve(args[2]);
                        if (!rol) return msg.channel.send('> Give me the ID or mention of the role.');
                        let server = await this.client.db.welcome.findOne({ guildID: msg.guild.id }).exec();
                        if (!server) server = new this.client.db.welcome({ guildID: msg.guild.id, userRoleID: rol.id });
                        server.userRoleID = rol.id;
                        server.save();
                        msg.channel.send(`> Now, the role ${rol} will be given when a user joins the server.`, { allowedMentions: { roles: [] } });
                        break;
                    }
                    case 'bot': {
                        let rol = msg.mentions.roles.first() || msg.guild.roles.resolve(args[2]);
                        if (!rol) return msg.channel.send('> Give me the ID or mention of the role.');
                        let server = await this.client.db.welcome.findOne({ guildID: msg.guild.id }).exec();
                        if (!server) server = new this.client.db.welcome({ guildID: msg.guild.id, botRoleID: rol.id });
                        server.botRoleID = rol.id;
                        server.save();
                        msg.channel.send(`> Now, the role ${rol} will be given when a bot joins the server.`, { allowedMentions: { roles: [] } });
                        break;
                    }
                    default: {
                        msg.channel.send(`You must choose what type of member you want to give the role to.
> ${this.prefix}welcome autorole [user | bot] [@role]`);
                    }
                }
                break;
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
> \`${this.prefix}welcome message {embed:[embed name]}\``)
.setFooter('<> Optional | [] Required'));
        }
    }
};