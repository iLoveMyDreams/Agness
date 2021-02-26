const BaseCommand = require('../../Utils/BaseCommand.js');

module.exports = class EvalCommand extends BaseCommand {
	constructor(client) {
		super(client, {
			name: 'bl',
			aliases: ['blacklist'],
			category: 'Devs',
			guildOnly: false,
			devsOnly: true
		});
	}

	async run(msg, args) {
		if (!args[0]) return this.sendEmbed(msg, `You must give me a username.
**Correct Use:**
> ${this.prefix}bl [@mention] <reason>`);
		const matchUser = args[0].match(/^<@!?(\d+)>$/);
		const user = matchUser ? await this.client.users.fetch(matchUser[1]).catch(() => null) : await this.client.users.fetch(args[0]).catch(() => null);
		if (!user) return this.sendEmbed(msg, `You have provided an invalid user.
**Correct Use:**
> ${this.prefix}bl [@mention] <reason>`);
		let blacklist = await this.client.db.blacklist.findOne({ userID: user.id });
		if (blacklist) {
			blacklist = await this.client.db.blacklist.findOneAndDelete({ userID: user.id });
			return this.sendEmbed(msg, `The user was successfully removed from the blacklist.
> **UserTag:** ${user.tag}
> **ID:** ${user.id}`);
		} else {
			if (!args[1]) return this.sendEmbed(msg, `You must give me a username and reason.
**Correct Use:**
> ${this.prefix}bl [@mention] [reason]`);
			const fecha = new Date();
			blacklist = new this.client.db.blacklist({ userID: user.id, reason: args.slice(1).join(' '), date: fecha });
			blacklist.save();
			return this.sendEmbed(msg, `The user was successfully added from the blacklist.
> **UserTag:** ${user.tag}
> **ID:** ${user.id}
> **Reason:** ${args.slice(1).join(' ')}
> **Date:** ${fecha.toLocaleString()}`);
		}
	}
};