const { Schema, model } = require('mongoose');

const welcome = Schema({
    guildID: String,
    channelID: { type: String, default: '' },
    embed_name: { type: String, default: '' },
    message: { type: String, default: '' },
    userRoleID: { type: String, default: '' },
    botRoleID: { type: String, default: '' }
});

module.exports = model('welcome', welcome);