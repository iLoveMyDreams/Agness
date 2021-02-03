const BaseCommand = require('../../Utils/BaseCommand.js')
const fetch = require('node-fetch');

module.exports = class DJSCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'djs',
            botChannelPermissions: ['EMBED_LINKS'],
        })
    }

    async run(msg, args) {
        if (!args[0]) return msg.channel.send('What do you want to search?');
        let response = await fetch(`https://djsdocs.sorta.moe/v2/embed?src=stable&q=${encodeURIComponent(args.join(' '))}`).catch(() => { });
        if (!response) return msg.channel.send('I didn\'t find results');
        let embed = await response.json().catch(() => { });
        if (!embed) return msg.channel.send('I didn\'t find anything in the documentation.')
        msg.channel.send({ embed }).catch(() => { });
    }
}