require('dotenv').config()
const Discord = require('discord.js')
const path = require('path')

const shards = new Discord.ShardingManager(path.join(__dirname, 'bot.js'), {
    token: process.env.TOKEN
})
shards.spawn()