const { Schema, model } = require('mongoose');

const blacklist = Schema({
	userID: String,
	reason: String,
	date: Date
});

module.exports = model('blacklist', blacklist);