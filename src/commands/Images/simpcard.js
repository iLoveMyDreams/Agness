const BaseCommand = require('../../Utils/BaseCommand.js')
const { createCanvas, loadImage } = require('canvas');
module.exports = class CatCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'simpcard',
            category: 'Images'
        })
    }

    async run(msg, args) {
        let user =  msg.mentions.users.first() || (args[0] ? await this.client.users.fetch(args[0]) : msg.author) || msg.author

        let avatar = user.displayAvatarURL({dynamic: false, format: 'png', size: 256});
		const canvas = createCanvas(318, 192);
		const ctx = canvas.getContext('2d');

		const bg = await loadImage(
			'https://i.imgur.com/GGBymND.jpg'
		);
		ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

		ctx.beginPath();
		ctx.arc(70, 75, 50, 0, Math.PI * 2);
		ctx.fillStyle = '#ffffff';
		ctx.fill();
		ctx.stroke();
		ctx.closePath();
		ctx.clip();

		let imagen = await loadImage(avatar);
		ctx.drawImage(imagen, 20, 23.5, 100, 100);

    const att = new Discord.MessageAttachment(canvas.toBuffer(), 'AsunaSimpCard.png')
    msg.channel.send(att)
    }
}