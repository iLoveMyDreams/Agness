require('dotenv').config()
global.Discord = require('discord.js')
const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')
new (
    class Yuuki extends Discord.Client {
        constructor() {
            super()
            mongoose.connect(process.env.MONGO_URL, {
                useNewUrlParser: true, useUnifiedTopology: true
            }, (err) => {
                if (err) return console.log(`MONGO >> A ocurrido un error: ${err.message || err}`)
                console.log('MONGO >> Conectado a la Base de Datos')
            })
            this.db = require("./database/index.js")
            this.commands = new Discord.Collection()
            this.loadCommands()
            this.loadEvents()
            this.login(process.env.TOKEN)
        }
        loadEvents() {
            const carpeta = path.join(__dirname, 'events')
            const categorias = fs.readdirSync(carpeta).filter(f => fs.statSync(path.join(carpeta, f)).isDirectory())
            for (const categoria of categorias) {
                const events = fs.readdirSync(path.join(carpeta, categoria)).filter(x => x.endsWith('.js'))
                for (const event of events) {
                    const eventContent = require(`./events/${categoria}/${event}`)
                    const eventClass = new eventContent(this)
                    this.on(eventClass.name, (...a) => eventClass.run(...a))
                }
            }
        }
        loadCommands() {

            const carpeta = path.join(__dirname, 'commands')
            const categorias = fs.readdirSync(carpeta).filter(f => fs.statSync(path.join(carpeta, f)).isDirectory())
            for (const categoria of categorias) {
                const comandos = fs.readdirSync(path.join(carpeta, categoria)).filter(x => x.endsWith('.js'))
                for (const comando of comandos) {
                    const comadoContent = require(`./commands/${categoria}/${comando}`)
                    const comandoClass = new comadoContent(this)
                    this.commands.set(comandoClass.name, comandoClass)
                }
            }
        }
    }
)()
