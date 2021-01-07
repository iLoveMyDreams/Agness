const {Schema, model} = require('mongoose');
const roles = Schema({
    guildID: String,
    messageID: String,
    RoleID: String,
    Reaction: String,
});
module.exports = model('roles', roles)