const { Schema, model } = require('mongoose');

const embed = Schema({
    guildID: String,
    canalID: { type: String, default: '' },
    embed_name: { type: String, default: '' },
    message: { type: String, default: '' }
});

module.exports = model('embed', embed);