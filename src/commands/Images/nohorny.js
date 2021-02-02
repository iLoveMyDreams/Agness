const BaseCommand = require('../../Utils/BaseCommand.js')
const { createCanvas, loadImage } = require('canvas');

module.exports = class CatCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'nohorny',
            alias: ['noh', 'cheems'],
            category: 'Images'
        })
    }

    async run(msg, args) {
        let user = msg.mentions.users.first() || (args[0] ? await this.client.users.fetch(args[0]).catch(() => { }) : msg.author) || msg.author
        const canvas = createCanvas(596, 514);
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const avatar = await loadImage(user.displayAvatarURL({ dynamic: false, format: 'png', size: 256 }));
        ctx.drawImage(avatar, 10, 140);

        const bg = await loadImage(
            'https://i.imgur.com/052Gnwz.png'
        );
        ctx.drawImage(bg, 0, 0);
        const att = new Discord.MessageAttachment(canvas.toBuffer(), 'AsunaNohorny.png')
        msg.channel.send(att)
    }
}