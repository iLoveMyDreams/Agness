const { DiscordAPIError } = require('discord.js');
const BaseCommand = require('../../Utils/BaseCommand.js');

module.exports = class CommentCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'comment',
            aliases: ['cm'],
        });
        this.types = ['.png', '.jpg', '.jpeg', '.gif'];
    }

    async run(msg, args) {
        const canalSuggest = await this.client.channels.fetch(process.env.SUGGEST_CHANNEL);
        const canalReport = await this.client.channels.fetch(process.env.REPORT_CHANNEL);
        const embed = new Discord.MessageEmbed()
            .setDescription(`You must put a valid property.
> \`${this.prefix}comment suggest [new suggest]\`
> \`${this.prefix}comment bug [command/event] [description]\``)
            .setColor(this.client.color)
            .setFooter(`Remember that you can also insert images or gifs.`)
        if (!args[0]) return msg.channel.send(embed)
        switch (args[0]) {
            case 'suggest': {
                const embedSuggest = new Discord.MessageEmbed()
                if (!args[1]) return msg.channel.send(`Tell me your suggestion.
> \`${this.prefix}comment suggest [new suggest]\``)
                if (args.slice(1).join(' ').length > 500) return msg.channel.send(`The suggestion must not exceed 500 characters`)
                if (msg.attachments.first() && this.types.some(x => msg.attachments.first().url.toLowerCase().endsWith(x))) {
                    const name = 'suggest.png'
                    if (msg.attachments.first().url.toLowerCase().endsWith('.gif')) name = 'suggest.gif'
                    const att = new Discord.MessageAttachment(msg.attachments.first().url, name)
                    embedSuggest.attachFiles([att])
                        .setImage(`attachment://${name}`);
                }
                embedSuggest.setAuthor(`New Suggest`)
                    .setDescription(`**Author:** ${msg.user.tag} | ${msg.user.id}
**Guild:** ${msg.guild.name} | ${msg.guild.id}
**Message:** ${args.slice(1).join(' ')}`)
                    .setTimestamp()
                canalSuggest.send(embedSuggest)
                break;
            }
            case 'bug': {
                const embedReport = new Discord.MessageEmbed()
                if (!args[1]) return msg.channel.send(`Tell me the bug to report.
> \`${this.prefix}comment bug [command/event] [description]\``)
                if (args.slice(2).join(' ').length > 500) return msg.channel.send(`The bug report must not exceed 500 characters.`)
                if (msg.attachments.first() && this.types.some(x => msg.attachments.first().url.toLowerCase().endsWith(x))) {
                    const name = 'suggest.png'
                    if (msg.attachments.first().url.toLowerCase().endsWith('.gif')) name = 'suggest.gif'
                    const att = new Discord.MessageAttachment(msg.attachments.first().url, name)
                    embedReport.attachFiles([att])
                        .setImage(`attachment://${name}`);
                }
                embedReport.setAuthor(`New Bug Report`)
                    .setDescription(`**Author:** ${msg.user.tag} | ${msg.user.id}
**Guild:** ${msg.guild.name} | ${msg.guild.id}
**Command or event:** ${args[1]}
**Message:** ${args.slice(2).join(' ')}`)
                    .setTimestamp()
                canalReport.send(embedReport)
                break;
            }
            default:
                break;
        }
    }
};