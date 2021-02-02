const BaseCommand = require('../../Utils/BaseCommand.js')
const util =  require('util');
const ch = require("child_process");
const exec = util.promisify(ch.exec);
const { Util } = require("discord.js");
module.exports = class ExecCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'exec',
            category: 'Devs',
            devsOnly: true
        })
    }
    async run(msg, args) {
        if(!args[0]) return msg.channel.send("Que pondre en la consola?");
        try {
            exec(args.join(" ")).then(e => {
                const { stdout, stderr } = e;
                if (!stdout && !stderr) return msg.channel.send("Lo ejecute, pero no hay nd q mostrar");
                if (stdout) {
                    const text = Util.splitMessage(stdout, { maxLength: 1950, char: "" });
                    msg.channel.send(text[0], { code: "sh" });
                }
                if (stderr) {
                    const text = Util.splitMessage(stderr, { maxLength: 1950, char: "" });
                    msg.channel.send(text[0], { code: "sh" });
                }
            }).catch(e => {
                const text = Util.splitMessage(util.inspect(e, { depth: 0 }), { maxLength: 1950, char: "" });
                msg.channel.send(text[0], { code: "sh" });
            });
        } catch (error) {
            const text = Util.splitMessage(util.inspect(error, { depth: 0 }), { maxLength: 1950, char: "" });
            await msg.channel.send(text[0], { code: "sh" });
        }
    }
}