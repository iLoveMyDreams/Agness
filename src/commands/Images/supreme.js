const BaseCommand = require('../../Utils/BaseCommand.js');
const { createCanvas, loadImage } = require('canvas');

module.exports = class CatCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'supreme',
            aliases: ['goku'],
            category: 'Images',
            guildOnly: false
        });
    }

    async run(msg, args) {
        const user = msg.mentions.users.first() || (args[0] ? await this.client.users.fetch(args[0]).catch(() => { }) : msg.author) || msg.author;
        const canvas = createCanvas(768, 768);
        const ctx = canvas.getContext('2d');
        const [img, bg] = await Promise.all([
            loadImage(user.displayAvatarURL({ dynamic: false, format: 'png', size: 256 })),
            loadImage('https://i.imgur.com/RXkUdK2.png')
        ]);
        ctx.drawImage(img, 260, 200, 250, 250);
        ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
        msg.channel.send(new Discord.MessageAttachment(canvas.toBuffer(), 'AsunaSupreme.png'));
    }
};