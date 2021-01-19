const { Schema, model } = require('mongoose');

const leave = Schema({
    guildID: String,
    channelID: { type: String, default: '' },
    embed_name: { type: String, default: '' },
    message: { type: String, default: '' }
});

module.exports = model('leave', leave);