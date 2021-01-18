const EmbedCommand = require('../../commands/Config/embed.js')

module.exports = class MessageEvent {
    constructor(client) {
        this.client = client;
        this.name = 'guildMemberAdd';
    }

    async run(member) {
        let server = await this.client.db.welcome.findOne({ guildID: member.guild.id }).exec()
        if (!server) return;
        let channel = member.guild.channels.resolve(server.canalID)
        if (!channel) return;
        let embed = server.embed_name ? new Discord.MessageEmbed() : null
        let embed_DB = await this.client.db.embed.findOne({ guildID: member.guild.id, embed_name: server.embed_name })
        const replaceText = (text) => EmbedCommand.replaceText(text, { channel, member, prefix: 'a' })
        if (embed_DB) {
            let prefix = '.'
            const modelo = await this.client.db.prefix.findOne({ _id: member.guild.id }).exec()
            prefix = modelo ? modelo.prefix : '.'

            if (embed_DB.author_text) {
                embed_DB.author_image ?
                    embed.setAuthor(replaceText(embed_DB.author_text), replaceText(embed_DB.author_image)) :
                    embed.setAuthor(replaceText(embed_DB.author_text))
            }
            if (embed_DB.title) embed.setTitle(replaceText(embed_DB.title))
            if (embed_DB.description) embed.setDescription(replaceText(embed_DB.description))
            if (embed_DB.thumbnail) embed.setThumbnail(replaceText(embed_DB.thumbnail))
            if (embed_DB.image) embed.setImage(replaceText(embed_DB.image))

            if (embed_DB.footer_text) {
                embed_DB.footer_image ?
                    embed.setFooter(replaceText(embed_DB.footer_text), replaceText(embed_DB.footer_image)) :
                    embed.setFooter(replaceText(embed_DB.footer_text))
            }
            if (embed_DB.timestamp) embed.setTimestamp()
            if (embed_DB) embed.setColor('#' + embed_DB.color)
        }
        if (!server.message && !embed) return;
        channel.send(replaceText(server.message), { embed })
    }
}