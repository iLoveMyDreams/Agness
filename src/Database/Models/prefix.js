const { Schema, model } = require('mongoose');
const prefix = Schema({
    _id: String,
    prefix: String
});
module.exports = model('prefix', prefix)