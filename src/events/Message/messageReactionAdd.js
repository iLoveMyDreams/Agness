module.exports = class MessageEvent {
    constructor(client) {
        this.client = client;
        this.name = 'messageReactionAdd';
    }
    async run(msgReaction, user) {

        let guild = msgReaction.message.guild;//la guild o servidor
        let mensaje = msgReaction.message; //el mensaje
        let miembro = guild.member(user); // Transformamos el usuario a miembro
        let emoji = msgReaction.emoji.id || msgReaction.emoji.name; // el emoji

        let emojiCheck = await this.client.db.reaction.findOne({ messageID: mensaje.id, reaction: emoji }).exec()
        let rol = guild.roles.cache.get(emojiCheck.roleID)
        if(!emojiCheck || rol.editable) return;
        miembro.roles.add(rol.id)


    }
}