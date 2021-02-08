const BaseCommand = require('../../Utils/BaseCommand.js');

module.exports = class InviteCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'vote',
            botChannelPermissions: ['EMBED_LINKS'],
          	guildOnly: false
        });
    }

    async run(msg) {
        msg.channel.send(new Discord.MessageEmbed()
            .setColor(this.client.color)
            .setDescription(`I really appreciate that you want to vote for me!
[Vote for me here!](https://top.gg/bot/798573830645874718)
Remember that you can vote every 12 hours.`)
            .setFooter('With love ❤️')
            .setTimestamp());
    }
};