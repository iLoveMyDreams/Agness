const BaseCommand = require('../../Utils/BaseCommand.js');
const { createCanvas, loadImage } = require('canvas');

module.exports = class CatCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'nohorny',
            aliases: ['noh', 'cheems'],
            category: 'Images'
        });
    }

    async run(msg, args) {
        const user = msg.mentions.users.first() || (args[0] ? await this.client.users.fetch(args[0]).catch(() => { }) : msg.author) || msg.author;
        const canvas = createCanvas(596, 514);
        const ctx = canvas.getContext('2d');
        const [avatar, bg] = await Promise.all([
            loadImage(user.displayAvatarURL({ dynamic: false, format: 'png', size: 256 })),
            loadImage('https://i.imgur.com/052Gnwz.png')
        ]);
        ctx.fillStyle = '#fff';
        ctx.drawImage(avatar, 10, 140);
        ctx.drawImage(bg, 0, 0);
        msg.channel.send(new Discord.MessageAttachment(canvas.toBuffer(), 'AsunaNohorny.png'));
    }
};