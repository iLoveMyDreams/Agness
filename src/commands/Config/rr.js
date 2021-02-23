const BaseCommand = require('../../Utils/BaseCommand.js');

module.exports = class ReactionRoleCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'rrole',
            aliases: ['rroles', 'rr'],
            description: 'You can put roles for reaction in the message that you want, colored roles, roles for mentions; everything is possible!',
            usage: (prefix) => `${prefix}rrole [@role] [type: normal/unique/only] [Message ID] <#channel>`,
            example: (prefix) => `${prefix}rrole @Beautiful normal #autoroles`,
            botGuildPermissions: ['MANAGE_ROLES'],
            memberGuildPermissions: ['ADMINISTRATOR'],
            botChannelPermissions: ['EMBED_LINKS'],
            category: 'Config'
        });

        this.types = ['normal', 'unique', 'only'];
        this.emojiUnicode = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;
        this.emojiDiscord = /<a?:[a-z]{3,32}:\d{16,19}>/gi;
    }

    async run(msg, args) {
        if (!args[0]) return msg.channel.send(new Discord.MessageEmbed()
            .setColor(this.client.color)
            .setDescription(`You must put a valid option or role.
> \`${this.prefix}rrole [@role] [type] [messageID] <#channel>\`
> \`${this.prefix}rrole delete [emoji] [messageID]\`

To see the types of a reaction role use:
> \`${this.prefix}rrole types\``)
            .setFooter('<> Optional | [] Required'));
        switch (args[0].toLowerCase()) {
            case 'types':
                return msg.channel.send(new Discord.MessageEmbed()
                    .setColor(this.client.color)
                    .addField('Types', `Normal => The role can be obtained and removed with the same reaction.
Unique => It can only be obtained, but not removed.
Only => Only one role reaction of the same type can be obtained in the message.`));
            case 'delete': {
                if (!args[1] || !args[2]) return msg.channel.send('You must specify the emoji and message ID.');
                if (!this.emojiUnicode.test(args[1]) && !this.emojiDiscord.test(args[1])) return msg.channel.send('You must put an emoji.');
                const emojiID = args[1].includes(':') ? args[1].split(':')[2].slice(0, -1) : args[1];
                const emojiCheck = await this.client.db.reaction.findOneAndDelete({ guildID: msg.guild.id, messageID: args[2], reaction: emojiID });
                if (!emojiCheck)
                    return msg.channel.send('The reaction role couldn\'t be deleted, check if there\'s one with that message ID and emoji in the server.');
                return msg.channel.send(`Reaction role with emoji ${args[1]} deleted successfully.`);
            }
        }

        if (!args[1] || !args[2]) return msg.channel.send('You must specify the role, type and message ID.');
        const matchRole = args[0].match(/^<@&(\d+)>$/);
        const role = matchRole ? msg.guild.roles.resolve(matchRole[1]) : msg.guild.roles.resolve(args[0]);
        if (!role) return msg.channel.send('I couldn\'t find that role or it\'s invalid.');
        if (!role.editable) return msg.channel.send('I don\'t have enough permissions to give that role.');
        if (!this.types.includes(args[1].toLowerCase())) return msg.channel.send(`That's not a type of reaction role. To see all types use: \`${this.prefix}rr types\``);

        const msgID = args[2];
        const matchChannel = args[3] ? args[3].match(/^<#(\d+)>$/) : false;
        const channel = args[3] ? matchChannel ? msg.guild.channels.resolve(matchChannel[1]) : msg.guild.channels.resolve(args[3]) : msg.channel;
        if (!channel || channel.type !== 'text') return msg.channel.send('> I couldn\'t find the channel or it\'s invalid.');
        if (!channel.viewable) return msg.channel.send('I don\'t have permissions to see that channel.');
        if (!channel.permissionsFor(msg.guild.me).has('ADD_REACTIONS')) return msg.channel.send('I don\'t have permissions to add reactions in that channel.');

        try {
            var message = await channel.messages.fetch(msgID);
            if (!message) return msg.channel.send('The message wasn\'t found.');
        } catch {
            return msg.channel.send('There was an error finding the message, try again.');
        }

        const sent = await msg.channel.send(`I'm preparing the reaction role for ${role}.
You just need to react with the emoji with which you want the role to be given.`);
        try {
            const filter = (r, u) => u.id === msg.author.id;
            const collected = await sent.awaitReactions(filter, { max: 1, time: 30e3, error: ['time'] });
            const emoji = collected.first().emoji;
            sent.delete();
            if (emoji.id && !this.client.emojis.resolve(emoji.id)) return msg.channel.send('I couldn\'t find that emoji in my cache, try adding the emoji on the server.');
            const emojiID = emoji.id || emoji.name;
            const emojiCheck = await this.client.db.reaction.findOne({ messageID: message.id, reaction: emojiID });
            if (emojiCheck) return msg.channel.send('There\'s already a role reaction with that emoji.');
            const reactionRole = new this.client.db.reaction({ guildID: msg.guild.id, messageID: message.id, roleID: role.id, reaction: emojiID, type: args[1].toLowerCase() });
            await reactionRole.save();
            await message.react(emoji);
            return msg.channel.send(`Now, the role **${role.name}** will be given when they react to the emoji ${emoji} in that message`);
        } catch (e) {
            await sent.delete();
            return msg.channel.send('Time is over ;(');
        }
    }
};