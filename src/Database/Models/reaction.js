const { Schema, model } = require('mongoose');

const roles = Schema({
    guildID: String,
    messageID: String,
    roleID: String,
    reaction: String,
    type: String
});

module.exports = model('roles', roles);