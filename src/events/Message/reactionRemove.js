module.exports = class ReactionRemoveEvent {
    constructor(client) {
        this.client = client;
        this.name = 'messageReactionRemove';
    }

    async run(msgReaction, user) {
        let guild = msgReaction.message.guild;
        let mensaje = msgReaction.message; 
        let emoji = msgReaction.emoji.id || msgReaction.emoji.name; 
      
        if (!guild || user.bot) return;
      
        let miembro = await guild.members.fetch(user.id); 

        let emojiCheck = await this.client.db.reaction.findOne({ messageID: mensaje.id, reaction: emoji }).exec();
        if (!emojiCheck) return;

        let rol = guild.roles.cache.get(emojiCheck.roleID);
        if (!rol || !rol.editable) return;

        switch (emojiCheck.type) {
            case 'normal':
                miembro.roles.remove(rol.id);
                break;
            default:
                break;
        }
    }
};