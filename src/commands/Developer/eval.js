const BaseCommand = require('../../Utils/BaseCommand.js');
const util = require('util');

module.exports = class EvalCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'eval',
            aliases: ['e'],
            category: 'Devs',
            devsOnly: true
        });
    }

    async run(msg, args) {
        const filter = (reaction, user) => reaction.emoji.name === '🔨' && user.id === msg.author.id;
        try {
            let evaluated = eval(args.join(' '));
            if (evaluated instanceof Promise) evaluated = await evaluated;
            if (typeof evaluated !== 'string') evaluated = util.inspect(evaluated, { depth: 0 });
            const message = await msg.channel.send(evaluated.substring(0, 1990), { code: 'js' });
            await message.react('🔨');
            try {
                await message.awaitReactions(filter, { time: 15000, max: 1, errors: ['time'] });
                message.delete();
            } catch { }
        } catch (e) {
            const message = await msg.channel.send(e.toString(), { code: 'js' });
            await message.react('🔨');
            try {
                await message.awaitReactions(filter, { time: 15000, max: 1, errors: ['time'] });
                message.delete();
            } catch { }
        }
    }
};