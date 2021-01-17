const BaseCommand = require('../../Utils/BaseCommand.js')
const util = require('util')
module.exports = class EvalCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'eval',
            alias: ['e'],
            category: 'Devs',
            devsOnly: true
        })
    }
    async run(msg, args) {
        try {
            let evaluated = eval(args.join(' '))
            if (evaluated instanceof Promise) evaluated = await evaluated
            if (typeof evaluated !== 'string') evaluated = util.inspect(evaluated, { depth: 0 })
            msg.channel.send(evaluated.substring(0, 1990), { code: 'js' })
        } catch (e) {
            msg.channel.send(e.toString(), { code: 'js' })
        }
    }
}