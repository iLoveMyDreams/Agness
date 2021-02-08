module.exports = class ReactionAddEvent {
    constructor(client) {
        this.client = client;
        this.name = 'messageReactionAdd';
    }

    async run(msgReaction, user) {
        const guild = msgReaction.message.guild;
        const mensaje = msgReaction.message;
        const emoji = msgReaction.emoji.id || msgReaction.emoji.name;

        if (!guild || user.bot) return;

        try {
            const miembro = await guild.members.fetch(user.id);

            const emojiCheck = await this.client.db.reaction.findOne({ messageID: mensaje.id, reaction: emoji }).exec();
            if (!emojiCheck) return;

            const rol = guild.roles.cache.get(emojiCheck.roleID);
            if (!rol || !rol.editable) return;

            switch (emojiCheck.type) {
                case 'only': {
                    const emojis = await this.client.db.reaction.find({ messageID: mensaje.id, type: 'only' }).exec();
                    emojis.forEach(async (reactionRol) => {
                        if (reactionRol.reaction === emojiCheck.reaction) {
                            miembro.roles.add(rol.id);
                            return;
                        }
                        const reaction = msgReaction.message.reactions.resolve(reactionRol.reaction);
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
        } catch { }
    }
};