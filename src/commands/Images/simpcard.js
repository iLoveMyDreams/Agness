const BaseCommand = require('../../Utils/BaseCommand.js');
const { createCanvas, loadImage } = require('canvas');

module.exports = class CatCommand extends BaseCommand {
	constructor(client) {
		super(client, {
			name: 'simpcard',
			category: 'Images',
      guildOnly: false
		});
	}

	async run(msg, args) {
		const user = msg.mentions.users.first() || (args[0] ? await this.client.users.fetch(args[0]).catch(() => { }) : msg.author) || msg.author;
		const avatar = user.displayAvatarURL({ dynamic: false, format: 'png', size: 256 });
		const canvas = createCanvas(318, 192);
		const ctx = canvas.getContext('2d');
		const [bg, img] = await Promise.all([
			loadImage('https://i.imgur.com/GGBymND.jpg'),
			loadImage(avatar)
		]);
		ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
		ctx.beginPath();
		ctx.arc(70, 75, 50, 0, Math.PI * 2);
		ctx.fillStyle = '#ffffff';
		ctx.fill();
		ctx.stroke();
		ctx.closePath();
		ctx.clip();
		ctx.drawImage(img, 20, 23.5, 100, 100);
		msg.channel.send(new Discord.MessageAttachment(canvas.toBuffer(), 'AsunaSimpCard.png'));
	}
};