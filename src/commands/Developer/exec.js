const BaseCommand = require('../../Utils/BaseCommand.js');
const util = require('util');
const ch = require('child_process');
const exec = util.promisify(ch.exec);

module.exports = class ExecCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'exec',
            category: 'Devs',
            devsOnly: true
        });
    }

    async run(msg, args) {
        if (!args[0]) return msg.channel.send('Qué pondré en la consola?');
        try {
            const { stdout, stderr } = await exec(args.join(' '));
            if (!stdout && !stderr) return msg.channel.send('Lo ejecuté, pero no hay nada que mostrar');
            if (stdout)
                msg.channel.send(stdout.slice(0, 1950), { code: 'sh' });
            if (stderr)
                msg.channel.send(stderr.slice(0, 1950), { code: 'sh' });
        } catch (error) {
            msg.channel.send(error.toString().slice(0, 1950), { code: 'sh' });
        }
    }
};