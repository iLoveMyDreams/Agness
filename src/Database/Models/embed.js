const {Schema, model} = require('mongoose');
const embed = Schema({
	guildID: String,
    embed_name: String,
    author_text: String,
    author_image: String,
    title: String,
    description: String,
    thumbnail: String,
    image: String,
    footer_text: String,
    footer_image: String,
    timestamp: Boolean,
    color: String,
});
module.exports = model('embed', embed)