const BaseCommand = require('../../Utils/BaseCommand.js')

module.exports = class HelpCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'help',
            alias: ['ayuda'],
            memberChannelPermissions: ['EMBED_LINKS'],
        })
    }

    async run(msg, args) {
        const embed = new Discord.MessageEmbed()
            .setColor(this.client.color)
        if (!args[0]) {
            embed.setTitle(`${this.client.user.username} Help Panel`)
                .setDescription(`Hi! At the moment I have 3 categories and ${this.client.commands.size - 1} commands.
If you need more detailed information about each command, you can use:
> ${this.prefix}help <Command>`)
                .addField(`Categories`, `> ${this.prefix}help Config • Configuration Commands
> ${this.prefix}help General • Commands in general
> ${this.prefix}help Images • Images of all types`)
                .addField('Links', `**[Invite](https://discord.com/api/oauth2/authorize?client_id=798573830645874718&permissions=8&scope=bot) | [Support Server](https://discord.gg/K63NqEDm86)**`)
            return msg.channel.send(embed)
        }
        const categorias = this.client.commands.filter((x) => x.category.toLowerCase() == args[0].toLowerCase()).array()
        const cmd = this.client.commands.get(args[0].toLowerCase()) || this.client.commands.find((x) => x.alias && x.alias.includes(args[0].toLowerCase()));

        if (categorias.length) {
            function split(arr, length) {
                let chunks = [],
                    i = 0,
                    n = arr.length;
                while (i < n) {
                    chunks.push(arr.slice(i, i += length));
                }
                return chunks;
            }

            function repeat(string, length) {
                let str = '';
                for (let i = 0; i < length; i++) {
                    str += string;
                }
                return str;
            }

            const commands = split(categorias.map((x) => x.name), 4);

            let cmdList = '';
            for (const cmds of commands) {
                for (const cmdname of cmds) {
                    const diff = parseInt(17 - cmdname.length);
                    cmdList += `${cmdname}${repeat(' ', diff)}`;
                }
                cmdList += '\n';
            }
            const embed_list = new Discord.MessageEmbed()
                .setTitle(`Commands in the category ${categorias[0].category}`)
                .setDescription(`This category has \`${categorias.length}\` commands.
If you need more detailed information about each command, you can use:
> ${this.prefix}help <Command>`)
                .addField('List of commands', `\`\`\`\n${cmdList}\n\`\`\``)
                .setColor(this.client.color)

            msg.channel.send(embed_list);
        } else if (cmd) {
            const comand_embed = new Discord.MessageEmbed()
                .setTitle(`${cmd.name} Command Help`)
                .setDescription(cmd.description)
                .addField('Category', cmd.category, true)
                .addField('Aliases', cmd.alias.length ? cmd.alias.join(' | ') : 'No aliases', true)
                .addField('Cooldown', cmd.cooldown, true)
                .addField('Use', cmd.usage(this.prefix), true)
                .addField('Example', cmd.example(this.prefix), true)
                .addField('In maintenance?', cmd.enabled ? 'No' : 'Si', true)
                .addField('NSFW Only?', cmd.nsfwOnly ? 'Si' : 'No', true)
                .addField('Servers Only?', cmd.guildOnly ? 'Si' : 'No', true)
                .addField('Developers Only?', cmd.devsOnly ? 'Si' : 'No', true)
                .addField('Bot Permissions', `> Channel:
  ${cmd.botChannelPermissions.length ? cmd.botChannelPermissions.join(', ') : 'Doesn\'t need.'}
  > Server:
  ${cmd.botGuildPermissions.length ? cmd.botGuildPermissions.join(', ') : 'Doesn\'t need.'}`, true)
                .addField('Member Permissions:', `> Channel
  ${cmd.memberChannelPermissions.length ? cmd.memberChannelPermissions.join(', ') : 'Doesn\'t need.'}
  > Server:
  ${cmd.memberGuildPermissions.length ? cmd.memberGuildPermissions.join(', ') : 'Doesn\'t need.'}`, true)
                .setColor(this.client.color)
            msg.channel.send(comand_embed);
        } else {
            msg.channel.send(`> Command or category not found.`);
        }
    }
}