module.exports = class ReactionRemoveEvent {
    constructor(client) {
        this.client = client;
        this.name = 'messageReactionRemove';
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
                case 'normal':
                    miembro.roles.remove(rol.id);
                    break;
                default:
                    break;
            }
        } catch { }
    }
};