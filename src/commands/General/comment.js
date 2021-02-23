const BaseCommand = require('../../Utils/BaseCommand.js');

module.exports = class CommentCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'comment',
            aliases: ['cm']
        });

        this.types = ['.png', '.jpg', '.jpeg', '.gif'];
        this.helpEmbed = () => new Discord.MessageEmbed()
            .setDescription(`You must put a valid property.
> \`${this.prefix}comment suggest [new suggest]\`
> \`${this.prefix}comment bug [command/event] [description]\``)
            .setColor(this.client.color)
            .setFooter('Remember that you can also insert images or gifs.');
    }

    async run(msg, args) {
        if (!args[0]) return msg.channel.send(this.helpEmbed());

        const canalSuggest = await this.client.channels.fetch(process.env.SUGGEST_CHANNEL);
        const canalReport = await this.client.channels.fetch(process.env.REPORT_CHANNEL);
        const extension = (msg.author.avatar || '').startsWith('a_') ? 'gif' : 'png';
        const avatar = msg.author.displayAvatarURL({ format: extension, size: 4096 });
        const avatarAtt = new Discord.MessageAttachment(avatar, `avatar.${extension}`);
        switch (args[0]) {
            case 'suggest': {
                const embedSuggest = new Discord.MessageEmbed();
                if (!args[1]) return msg.channel.send('Tell me your suggestion.');
                if (args.slice(1).join(' ').length < 30) return msg.channel.send('Your suggestion must have a minimum of 30 characters.');
                if (args.slice(1).join(' ').length > 500) return msg.channel.send('The suggestion mustn\'t exceed 500 characters');
                if (msg.attachments.first() && this.types.some(x => msg.attachments.first().url.toLowerCase().endsWith(x))) {
                    let name = 'suggestion.png';
                    if (msg.attachments.first().url.toLowerCase().endsWith('.gif'))
                        name = 'suggestion.gif';
                    const att = new Discord.MessageAttachment(msg.attachments.first().url, name);
                    embedSuggest.attachFiles([att, avatarAtt])
                        .setImage(`attachment://${name}`)
                        .setThumbnail(`attachment://avatar.${extension}`);
                } else {
                    embedSuggest.attachFiles([avatarAtt])
                        .setThumbnail(`attachment://avatar.${extension}`);
                }
                embedSuggest.setAuthor('New Suggest', this.client.user.displayAvatarURL())
                    .setDescription(`**Author:** ${msg.author.tag} | ${msg.author.id}
**Guild:** ${msg.guild.name} | ${msg.guild.id}
**Message:** ${args.slice(1).join(' ')}`)
                    .setTimestamp()
                    .setColor(this.client.color);
                await canalSuggest.send(embedSuggest);
                msg.channel.send('Your suggestion has been sent successfully.');
                break;
            }
            case 'bug': {
                if (!args[1]) return msg.channel.send('You must specify if the bug is from a command or an event.');
                if (!args[2]) return msg.channel.send('You must specify the description of the bug.');
                if (args.slice(1).join(' ').length < 30) return msg.channel.send('Your bug report must be a minimum of 30 characters.');
                if (args.slice(2).join(' ').length > 500) return msg.channel.send('The bug report must not exceed 500 characters.');
                const embedReport = new Discord.MessageEmbed();
                if (msg.attachments.first() && this.types.some((t) => msg.attachments.first().url.toLowerCase().endsWith(t))) {
                    let name = 'suggest.png';
                    if (msg.attachments.first().url.toLowerCase().endsWith('.gif')) name = 'suggest.gif';
                    const att = new Discord.MessageAttachment(msg.attachments.first().url, name);
                    embedReport.attachFiles([att, avatarAtt])
                        .setImage(`attachment://${name}`)
                        .setThumbnail(`attachment://avatar.${extension}`);
                } else
                    embedReport.attachFiles([avatarAtt])
                        .setThumbnail(`attachment://avatar.${extension}`);
                embedReport.setAuthor('New Bug Report', this.client.user.displayAvatarURL())
                    .setDescription(`**Author:** ${msg.author.tag} | ${msg.author.id}
**Guild:** ${msg.guild.name} | ${msg.guild.id}
**Command or event:** ${args[1]}
**Message:** ${args.slice(2).join(' ')}`)
                    .setTimestamp()
                    .setColor(this.client.color);
                await canalReport.send(embedReport);
                return msg.channel.send('Your bug report has been sent successfully.');
            }
            default:
                return msg.channel.send(this.helpEmbed());
        }
    }
};