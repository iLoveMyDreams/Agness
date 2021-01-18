const { Schema, model } = require('mongoose');

const embed = Schema({
    guildID: String,
    canalID: String,
    embed_name: String,
    message: String,
});

module.exports = model('embed', embed);