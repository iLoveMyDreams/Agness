const BaseCommand = require('../../Utils/BaseCommand.js')
const fetch = require('node-fetch');
module.exports = class DJSCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'djs',
            memberChannelPermissions = ['EMBED_LINKS'],
        })
    }

    async run(msg, args) {
        if (!args[0]) return msg.channel.send('¿Qué quieres que busque?');
        let response = await fetch(`https://djsdocs.sorta.moe/v2/embed?src=stable&q=${encodeURIComponent(args.join(' '))}`).catch(() => { });
        if (!response) return msg.channel.send('No obtuve resultados');
        let embed = await response.json().catch(() => { });
        if (!embed) return msg.channel.send("No encontre nada en la documentación.")
        msg.channel.send({ embed: embed }).catch(() => { });
    }
}