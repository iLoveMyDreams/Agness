module.exports = class ReactionRemoveEvent {
    constructor(client) {
        this.client = client;
        this.name = 'messageReactionRemove';
    }

    async run(msgReaction, user) {
        let guild = msgReaction.message.guild;//la guild o servidor
        let mensaje = msgReaction.message; //el mensaje
        let emoji = msgReaction.emoji.id || msgReaction.emoji.name; // el emoji

        if (!guild || user.bot) return

        let miembro = guild.member(user);

        let emojiCheck = await this.client.db.reaction.findOne({ messageID: mensaje.id, reaction: emoji }).exec()
        if (!emojiCheck) return;

        let rol = guild.roles.cache.get(emojiCheck.roleID)
        if (!rol || !rol.editable) return;

        switch (emojiCheck.type) {
            case 'normal':
                miembro.roles.remove(rol.id)
                break;
            default:
                break;
        }
    }
}