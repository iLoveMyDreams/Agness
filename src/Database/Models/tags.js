const { Schema, model } = require('mongoose');
const tags = Schema({
    guildID: String,
    tag_name: String,
    message: String,
    embed_name: String,
    addRoleID: String,
    deleteRoleID: String,
    
});

module.exports = model('tags', tags);