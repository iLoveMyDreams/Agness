require('dotenv').config()
global.Discord = require('discord.js')
const path = require('path')

var Shards = new Discord.ShardingManager(path.join(__dirname, 'bot.js'), {
    token: process.env.TOKEN
})
Shards.spawn()