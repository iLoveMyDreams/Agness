const { Schema, model } = require('mongoose');

const tags = Schema({
    guildID: String,
    name: String,
    message: { type: String, default: '' },
    embed_name: { type: String, default: '' },
    addRoleID: [String],
    deleteRoleID: [String],
    image: { type: String, default: '' }
});

module.exports = model('tags', tags);