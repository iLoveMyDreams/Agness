const BaseCommand = require('../../Utils/BaseCommand.js')

module.exports = class HelpCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'help',
            alias: ['ayuda'],
            botChannelPermissions: ['EMBED_LINKS'],
        })
    }

    async run(msg, args) {
        if (!args[0]) return msg.channel.send(new Discord.MessageEmbed()
            .setColor(this.client.color)
            .setTitle(`${this.client.user.username} Help Panel`)
            .setDescription(`Hi! At the moment I have 3 categories and ${this.client.commands.size - 1} commands.
If you need more detailed information about each command, you can use:
> ${this.prefix}help <Command>`)
            .addField(`Categories`, `> ${this.prefix}help Config • Configuration Commands
> ${this.prefix}help General • Commands in general
> ${this.prefix}help Images • Images of all types`)
            .addField('Links', `**[Bot Invite](https://discord.com/api/oauth2/authorize?client_id=798573830645874718&permissions=8&scope=bot) | [Support Server](https://discord.gg/K63NqEDm86)**`))

        const category = this.client.commands.filter((x) => x.category.toLowerCase() == args[0].toLowerCase()).array()
        const cmd = this.client.commands.get(args[0].toLowerCase()) || this.client.commands.find((x) => x.alias && x.alias.includes(args[0].toLowerCase()));

        if (category.length) {
            const lines = Array(Math.ceil(category.length / 4)).fill([])
                .map((_, i) => category.map((c) => c.name).slice(i * 4, (i * 4) + 4));

            let cmdList = '';
            for (const cmds of lines) {
                for (const cmd of cmds) {
                    const diff = parseInt(17 - cmd.length);
                    cmdList += `${cmd}${Array(diff).fill(' ').join('')}`;
                }
                cmdList += '\n';
            }

            return msg.channel.send(new Discord.MessageEmbed()
                .setTitle(`Commands in the category ${category[0].category}`)
                .setDescription(`This category has \`${category.length}\` commands.
If you need more detailed information about each command, you can use:
> ${this.prefix}help <Command>`)
                .addField('List of commands', `\`\`\`\n${cmdList}\n\`\`\``)
                .setColor(this.client.color));
        } else if (cmd) {
            return msg.channel.send(new Discord.MessageEmbed()
                .setTitle(`${cmd.name.replace(/^[a-z]/gi, (c) => c.toUpperCase())} Command Help`)
                .setDescription(cmd.description)
                .addField('Category', cmd.category, true)
                .addField('Aliases', cmd.alias.length ? cmd.alias.join(' | ') : 'No aliases', true)
                .addField('Cooldown', cmd.cooldown, true)
                .addField('Use', cmd.usage(this.prefix), true)
                .addField('Example', cmd.example(this.prefix), true)
                .addField('In maintenance?', cmd.enabled ? 'No' : 'Yes', true)
                .addField('NSFW Only?', cmd.nsfwOnly ? 'Yes' : 'No', true)
                .addField('Servers Only?', cmd.guildOnly ? 'Yes' : 'No', true)
                .addField('Developers Only?', cmd.devsOnly ? 'Yes' : 'No', true)
                .addField('Bot Permissions', `> Channel:
${cmd.botChannelPermissions.length ? cmd.botChannelPermissions.join(', ') : 'Doesn\'t need.'}
> Server:
${cmd.botGuildPermissions.length ? cmd.botGuildPermissions.join(', ') : 'Doesn\'t need.'}`, true)
                .addField('Member Permissions:', `> Channel
${cmd.memberChannelPermissions.length ? cmd.memberChannelPermissions.join(', ') : 'Doesn\'t need.'}
> Server:
${cmd.memberGuildPermissions.length ? cmd.memberGuildPermissions.join(', ') : 'Doesn\'t need.'}`, true)
                .setColor(this.client.color));
        } else return msg.channel.send(`> Command or category not found.`);
    }
}