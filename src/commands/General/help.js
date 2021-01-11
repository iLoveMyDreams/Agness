const BaseCommand = require('../../Utils/BaseCommand.js')
module.exports = class HelpCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'help',
            alias: ['ayuda']
        })
    }
    async run(msg, args) {
        let prefix = '.'
        if (msg.guild) {
            const modelo = await this.client.db.prefix.findOne({ _id: msg.guild.id }).exec()
            prefix = modelo ? modelo.prefix : '.'
        }
        const embed = new Discord.MessageEmbed()
        if (!args[0]) {
            embed.setTitle(`Panel de ayuda de ${this.client.user.username}`)
                .setDescription(`Hola! en estos momentos cuento con 3 categorias y ${this.client.commands.size} comandos
Si necesitas una informacion mas detallada de cada comando puedes utilizar:
> ${prefix}help <comando>`)
                .addField(`Categorias`, `> ${prefix}help Config • Comandos de Configuración
> ${prefix}help General • Comandos en general`)
                .addField(`Enlaces`, `**[Link de Invitación](https://discord.com/api/oauth2/authorize?client_id=791024013224837161&permissions=8&scope=bot) | [Servidor de Soporte](https://discord.gg/TxsqJVsFgk)**`)
                .setColor('#9d5fb1')
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
                .setTitle(`Comandos de la categoría ${categorias[0].category}`)
                .setDescription(`Esta categoria cuenta con \`${categorias.length}\` comandos.
  Si necesitas información mas detallada de cada uno de los comandos puedes usar:
  > ${prefix}help <comando>`)
                .addField(`Lista de comandos:`, `\`\`\`\n${cmdList}\n\`\`\``)
                .setColor('#9d5fb1')

            msg.channel.send(embed_list);
        } else if (cmd) {
            const comand_embed = new Discord.MessageEmbed()
                .setTitle(`Ayuda del comando ${cmd.name}`)
                .setDescription(cmd.description)
                .addField('Categoria', cmd.category, true)
                .addField('Alias', cmd.alias.length ? cmd.alias.join(' | ') : 'No tiene alias', true)
                .addField('Cooldown', cmd.cooldown, true)
                .addField(`Uso:`, cmd.usage(prefix), true)
                .addField('Ejemplo', cmd.example(prefix), true)
                .addField('¿En mantenimiento?', cmd.enabled ? 'No' : 'Si', true)
                .addField('¿Solo NSFW?', cmd.nsfwOnly ? 'Si' : 'No', true)
                .addField('¿Solo Servidores?', cmd.guildOnly ? 'Si' : 'No', true)
                .addField('¿Solo Devs?', cmd.devsOnly ? 'Si' : 'No', true)
                .addField('Permisos del bot:', `> En el canal:
  ${cmd.botChannelPermissions.length ? cmd.botChannelPermissions.join(', ') : 'No necesita.'}
  > En el servidor:
  ${cmd.botGuildPermissions.length ? cmd.botGuildPermissions.join(', ') : 'No necesita.'}`, true)
                .addField('Permisos del miembro:', `> En el canal:
  ${cmd.memberChannelPermissions.length ? cmd.memberChannelPermissions.join(', ') : 'No necesita.'}
  > En el servidor:
  ${cmd.memberGuildPermissions.length ? cmd.memberGuildPermissions.join(', ') : 'No necesita.'}`, true)
                .setColor('#9d5fb1')
            msg.channel.send(comand_embed);
        } else {
            msg.channel.send(`> Comando o categoria no encontrados.`);
        }
    }
}