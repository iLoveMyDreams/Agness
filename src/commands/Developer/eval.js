const BaseCommand = require('../../Utils/BaseCommand.js');
const util = require('util');

module.exports = class EvalCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'eval',
            aliases: ['e'],
            category: 'Devs',
            guildOnly: false,
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
            try {
                await message.react('🔨');
                await message.awaitReactions(filter, { time: 15000, max: 1, errors: ['time'] });
                message.delete();
            } catch {
                await message.reactions.resolve('🔨').users.remove();
            }
        } catch (e) {
            const message = await msg.channel.send(e.toString(), { code: 'js' });
            try {
                await message.react('🔨');
                await message.awaitReactions(filter, { time: 15000, max: 1, errors: ['time'] });
                message.delete();
            } catch {
                await message.reactions.resolve('🔨').users.remove();
            }
        }
    }
};