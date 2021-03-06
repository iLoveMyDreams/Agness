const BaseCommand = require('../../Utils/BaseCommand.js');

module.exports = class PrefixCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'prefix',
            category: 'Config',
            description: 'Set my prefix to whatever you want',
            usage: (prefix) => `${prefix}prefix [New Prefix]`,
            example: (prefix) => `${prefix}prefix a!`,
            memberGuildPermissions: ['ADMINISTRATOR']
        });
    }

    async run(msg, args) {
        if (!args[0]) return msg.channel.send(`You must put the new prefix. The current prefix is ${this.prefix}`);
        if (args[0].length > 5) return msg.channel.send('You must put a prefix of less than 5 characters.');
        let server = await this.client.db.prefix.findOne({ _id: msg.guild.id });
        if (!server) server = new this.client.db.prefix({ _id: msg.guild.id, prefix: args[0] });
        server.prefix = args[0];
        await server.save();
        return msg.channel.send(`My new prefix is: \`${args[0]}\`.`);
    }
};