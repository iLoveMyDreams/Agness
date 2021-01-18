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
        if (server.message) {
            let embed = server.embed_name ? true : null
            if (embed) {
                let embed_DB = await this.client.db.embed.findOne({ guildID: member.guild.id, embed_name: server.embed_name })
                if (embed_DB) {
                    embed = Discord.MessageEmbed()

                    if (embed_DB.author_text) {
                        embed_DB.author_image ?
                            embed.setAuthor(this.replaceText(embed_DB.author_text, msg), this.replaceText(embed_DB.author_image, msg)) :
                            embed.setAuthor(this.replaceText(embed_DB.author_text, msg))
                    }
                    if (embed_DB.title) embed.setTitle(this.replaceText(embed_DB.title, msg))
                    if (embed_DB.description) embed.setDescription(this.replaceText(embed_DB.description, msg))
                    if (embed_DB.thumbnail) embed.setThumbnail(this.replaceText(embed_DB.thumbnail, msg))
                    if (embed_DB.image) embed.setImage(this.replaceText(embed_DB.image, msg))

                    if (embed_DB.footer_text) {
                        embed_DB.footer_image ?
                            embed.setFooter(this.replaceText(embed_DB.footer_text, msg), this.replaceText(embed_DB.footer_image, msg)) :
                            embed.setFooter(this.replaceText(embed_DB.footer_text, msg))
                    }
                    if (embed_DB.timestamp) embed.setTimestamp()
                    if (embed_DB) embed.setColor('#' + embed_DB.color)
                }
            }
            channel.send(server.message, embed)
        }
        else if (server.embed_name) {

            let embed_DB = await this.client.db.embed.findOne({ guildID: member.guild.id, embed_name: server.embed_name })
                if (embed_DB) {
                    let embed = Discord.MessageEmbed()

                    if (embed_DB.author_text) {
                        embed_DB.author_image ?
                            embed.setAuthor(this.replaceText(embed_DB.author_text, msg), this.replaceText(embed_DB.author_image, msg)) :
                            embed.setAuthor(this.replaceText(embed_DB.author_text, msg))
                    }
                    if (embed_DB.title) embed.setTitle(this.replaceText(embed_DB.title, msg))
                    if (embed_DB.description) embed.setDescription(this.replaceText(embed_DB.description, msg))
                    if (embed_DB.thumbnail) embed.setThumbnail(this.replaceText(embed_DB.thumbnail, msg))
                    if (embed_DB.image) embed.setImage(this.replaceText(embed_DB.image, msg))

                    if (embed_DB.footer_text) {
                        embed_DB.footer_image ?
                            embed.setFooter(this.replaceText(embed_DB.footer_text, msg), this.replaceText(embed_DB.footer_image, msg)) :
                            embed.setFooter(this.replaceText(embed_DB.footer_text, msg))
                    }
                    if (embed_DB.timestamp) embed.setTimestamp()
                    if (embed_DB) embed.setColor('#' + embed_DB.color)
                    channel.send(embed)
                }
        }
    }
}