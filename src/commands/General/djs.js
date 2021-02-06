const BaseCommand = require('../../Utils/BaseCommand.js');
const phin = require('phin');

module.exports = class DJSCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'djs',
            aliases: ['discordjs'],
            usage: (prefix) => `${prefix}djs [Content]`,
            botChannelPermissions: ['EMBED_LINKS']
        });
    }

    async run(msg, args) {
        if (!args[0]) return msg.channel.send('What do you want to search?');
        try {
            let response = await phin({
                url: `https://djsdocs.sorta.moe/v2/embed?src=stable&q=${encodeURIComponent(args.join(' '))}`,
                parse: 'json'
            });
            if (!response) return msg.channel.send('I didn\'t find anything in the documentation.');
            return msg.channel.send({ embed: response.body });
        } catch {
            return msg.channel.send('https://djsdocs.sorta.moe/v2/embed?src=stable&q=');
        }
    }
};