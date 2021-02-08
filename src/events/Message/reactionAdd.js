module.exports = class ReactionAddEvent {
    constructor(client) {
        this.client = client;
        this.name = 'messageReactionAdd';
    }

    async run(msgReaction, user) {
        let guild = msgReaction.message.guild;//la guild o servidor
        let mensaje = msgReaction.message; //el mensaje
        let emoji = msgReaction.emoji.id || msgReaction.emoji.name; // el emoji

        if (!guild || user.bot) return;
      
        let miembro = await guild.members.fetch(user.id);
        
      let emojiCheck = await this.client.db.reaction.findOne({ messageID: mensaje.id, reaction: emoji }).exec();
        if (!emojiCheck) return;

        let rol = guild.roles.cache.get(emojiCheck.roleID);
        if (!rol || !rol.editable) return;

        switch (emojiCheck.type) {
            case 'only': {
                let emojis = await this.client.db.reaction.find({ messageID: mensaje.id, type: 'only' }).exec();
                emojis.forEach(async (reactionRol) => {
                    if (reactionRol.reaction === emojiCheck.reaction) {
                        miembro.roles.add(rol.id);
                        return;
                    }
                    let reaction = msgReaction.message.reactions.resolve(reactionRol.reaction);
                    if (!reaction) return;
                    if (reaction.partial)
                        await reaction.fetch();
                    reaction.users.remove(user.id);
                    miembro.roles.remove(reactionRol.roleID);
                });
                break;
            }
            default:
                miembro.roles.add(rol.id);
                break;
        }
    }
};