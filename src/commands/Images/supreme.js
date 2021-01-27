const BaseCommand = require('../../Utils/BaseCommand.js')
const { createCanvas, loadImage } = require('canvas');

module.exports = class CatCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'supreme',
            alias: ['goku'],
            category: 'Images'
        })
    }

    async run(msg, args) {
        let user = msg.mentions.users.first() || (args[0] ? await this.client.users.fetch(args[0]) : msg.author) || msg.author

        const canvas = createCanvas(768, 768);
        const ctx = canvas.getContext('2d');

        const img = await loadImage(user.displayAvatarURL({ dynamic: false, format: 'png', size: 256 }));
        ctx.drawImage(img, 260, 200);

        const bg = await loadImage(
            'https://i.imgur.com/RXkUdK2.png'
        );
        ctx.drawImage(bg, 0, 0);

        const att = new Discord.MessageAttachment(canvas.toBuffer(), 'AsunaSimpCard.png')
        msg.channel.send(att)
    }
}