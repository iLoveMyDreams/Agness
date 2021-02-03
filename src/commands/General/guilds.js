/*
Copied from https://github.com/AndreMor955/gidget
Thanks Andremor ❤️
*/

const BaseCommand = require('../../Utils/BaseCommand.js')
module.exports = class GuildsCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'guilds',
            alias: ['servers'],
            botChannelPermissions: ['EMBED_LINKS'],
        })
    }

    async run(msg, args) {
        const servers = (await this.client.shard.fetchClientValues('guilds.cache.size')).reduce((acc, guildCount) => acc + guildCount, 0);
        const users = (await this.client.shard.fetchClientValues('users.cache.size')).reduce((acc, userCount) => acc + userCount, 0);

        const serverEmbed = new Discord.MessageEmbed()
            .setDescription("At this moment I am in **" + servers + "** servers and with **" + users + "** cached users.")
            .setColor(this.client.color)
        msg.channel.send(serverEmbed)
    }
}