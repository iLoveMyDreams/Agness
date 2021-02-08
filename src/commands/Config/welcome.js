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
> \`${this.prefix}welcome message {embed:[embed name]}\``)
            .setFooter('<> Optional | [] Required'));
        switch (args[0].toLowerCase()) {
            case 'channel': {
                if (!args[1]) return msg.channel.send('> Give me the ID or mention of the channel.');
							 if(args[1].toLoweCase() === 'null'){
							 let server = await this.client.db.welcome.findOne({ guildID: msg.guild.id }).exec();
                if (!server) server = new this.client.db.welcome({ guildID: msg.guild.id, channelID: '' });
                server.channelID = '';
                server.save();
                msg.channel.send(`The channel was successfully removed.`);
               }
              const matchChannel = args[1] ? args[1].match(/^<#(\d+)>$/) : false;
                const canal = matchChannel ? msg.guild.channels.resolve(matchChannel[1]) : msg.guild.channels.resolve(args[1]);
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
							 if(args[1].toLoweCase() === 'null'){
							 		let server = await this.client.db.welcome.findOne({ guildID: msg.guild.id }).exec();
                	 if (!server) server = new this.client.db.welcome({ guildID: msg.guild.id, embed_name: '', message: '' });
                    server.embed_name = '';
                    server.message = '';
                	 server.save();
                   msg.channel.send(`The message was successfully deleted.`);
               }
                if (/{embed:.+}/gi.test(args[1])) {
                    const embed = args[1].match(/{embed:.+}/gi)[0].split(':')[1].slice(0, -1);
                    if (embed) {
                        const checkear = await this.client.db.embed.findOne({ guildID: msg.guild.id, embed_name: embed }).exec();
                        if (!checkear) return msg.channel.send(`> There's no embed with that name.
You can see the list of embeds with:
> \`${this.prefix}embed list\``);
                    }
                    let server = await this.client.db.welcome.findOne({ guildID: msg.guild.id }).exec();
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
                        embed = embed.split(':')[1].slice(0, -1);
                        const checkear = await this.client.db.embed.findOne({ guildID: msg.guild.id, embed_name: embed }).exec();
                        if (!checkear) return msg.channel.send('> There\'s no embed with that name.');
                    }
                    let server = await this.client.db.welcome.findOne({ guildID: msg.guild.id }).exec();
                    if (!server) server = new this.client.db.welcome({ guildID: msg.guild.id, embed_name: embed ? embed : '', message });
                    server.embed_name = embed ? embed : '';
                    server.message = message;
                    server.save();
                    this.sendEmbed(msg,`The message ${embed ? 'and embed ' : ''}of welcomes has been updated correctly.
If you need to see how the messages and roles it gives would be, you can use:
> \`${this.prefix}test welcome\``);
                }
                break;
            }
            case 'autorole': {
                switch (args[1]) {
                    case 'user': {
                      	if(!args[2]) return msg.channel.send(`> Give me the ID or mention of the role.`)
                      	if(args[1].toLoweCase() === 'null'){
							 					let server = await this.client.db.welcome.findOne({ guildID: msg.guild.id }).exec();
                     			if (!server) server = new this.client.db.welcome({ guildID: msg.guild.id, userRoleID: '' });
                    			server.userRoleID = '';
                	 				server.save();
                   				msg.channel.send(`Users will no longer be given a role.`);
              				 }
                        const rol = msg.mentions.roles.first() || msg.guild.roles.resolve(args[2]);
                        if (!rol) return msg.channel.send('> Give me the ID or mention of the role.');
                        let server = await this.client.db.welcome.findOne({ guildID: msg.guild.id }).exec();
                        if (!server) server = new this.client.db.welcome({ guildID: msg.guild.id, userRoleID: rol.id });
                        server.userRoleID = rol.id;
                        server.save();
                        this.sendEmbed(msg, `Now, the role ${rol} will be given when a user joins the server.
If you need to see how the messages and roles it gives would be, you can use:
> \`${this.prefix}test welcome\``);
                        break;
                    }
                    case 'bot': {
                      	if(!args[2]) return msg.channel.send(`> Give me the ID or mention of the role.`)
                      	if(args[1].toLoweCase() === 'null'){
							 					let server = await this.client.db.welcome.findOne({ guildID: msg.guild.id }).exec();
                     			if (!server) server = new this.client.db.welcome({ guildID: msg.guild.id, botRoleID: '' });
                    			server.userRoleID = '';
                	 				server.save();
                   				msg.channel.send(`Users will no longer be given a role.`);
              				 }
                        const rol = msg.mentions.roles.first() || msg.guild.roles.resolve(args[2]);
                        if (!rol) return msg.channel.send('> Give me the ID or mention of the role.');
                        let server = await this.client.db.welcome.findOne({ guildID: msg.guild.id }).exec();
                        if (!server) server = new this.client.db.welcome({ guildID: msg.guild.id, botRoleID: rol.id });
                        server.botRoleID = rol.id;
                        server.save();
                        this.sendEmbed(msg, `> Now, the role ${rol} will be given when a bot joins the server.
If you need to see how the messages and roles it gives would be, you can use:
> \`${this.prefix}test welcome\``);
                        break;
                    }
                    default: {
                        msg.channel.send(`You must choose what type of member you want to give the role to.
> \`${this.prefix}welcome autorole [user | bot] [@role]\``);
                    }
                }
                break;
            }
          case 'config': {
					  let server = await this.client.db.welcome.findOne({ guildID: msg.guild.id }).exec();
             if (!server) server = new this.client.db.welcome({ guildID: msg.guild.id});
						server.save();
            const configEmbed = new Discord.MessageEmbed()
            .setTitle(`${msg.guild.name} welcome configuration`)
            .setDescription(`**Channel:** ${server.channelID ? `<#${server.channelID}>` : `Does not have.`}
**User AutoRole:** ${server.userRoleID ? `<@&${server.userRoleID}>` : `Does not have.`}
**Bot AutoRole:** ${server.botRoleID ? `<@&${server.botRoleID}>` : `Does not have.`}
**Embed Name:** ${server.embed_name ? server.embed_name : `Does not have.`}`)
						.addField(`Message:`, `${server.message ? server.message.length > 1024 ? `${server.message.substring(0, 1000)}. And more..` : server.message : `Does not have.`}`)
          	msg.channel.send(configEmbed)
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