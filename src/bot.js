require('dotenv').config();
global.Discord = require('discord.js');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
new (
    class Agness extends Discord.Client {
        constructor() {
            super({ partials: ['MESSAGE', 'REACTION', 'CHANNEL'], intents: 5635 });
            mongoose.connect(process.env.MONGO_URL, {
                useNewUrlParser: true, useUnifiedTopology: true
            }, (err) => {
                if (err) return console.log(`MONGO >> A ocurrido un error: ${err.message || err}`);
                console.log('MONGO >> Conectado a la Base de Datos');
            });
            this.db = require(path.join(__dirname, 'Database', 'index.js'));
            this.commands = new Discord.Collection();
            this.color = '#637cf6';
            this.loadCommands();
            this.loadEvents();
            this.login(process.env.TOKEN);
        }

        loadEvents() {
            const carpeta = path.join(__dirname, 'events');
            const categorias = fs.readdirSync(carpeta).filter(f => fs.statSync(path.join(carpeta, f)).isDirectory());
            for (const categoria of categorias) {
                const events = fs.readdirSync(path.join(carpeta, categoria)).filter(x => x.endsWith('.js'));
                for (const event of events) {
                    const eventContent = require(`./events/${categoria}/${event}`);
                    const eventClass = new eventContent(this);
                    this.on(eventClass.name, (...a) => eventClass.run(...a));
                }
            }
        }

        loadCommands() {
            const carpeta = path.join(__dirname, 'commands');
            const categorias = fs.readdirSync(carpeta).filter(f => fs.statSync(path.join(carpeta, f)).isDirectory());
            for (const categoria of categorias) {
                const comandos = fs.readdirSync(path.join(carpeta, categoria)).filter(x => x.endsWith('.js'));
                for (const comando of comandos) {
                    const comadoContent = require(`./commands/${categoria}/${comando}`);
                    const comandoClass = new comadoContent(this);
                    this.commands.set(comandoClass.name, comandoClass);
                }
            }
        }

        async replaceText(text, { channel, member, prefix }) {
            const owner = await member.guild.members.fetch(member.guild.ownerID);
            return text.replace(/{user}/gi, member.user.toString())
                .replace(/{user\.tag}/gi, member.user.tag)
                .replace(/{user\.discrim}/gi, member.user.discriminator)
                .replace(/{user\.avatar}/gi, member.user.displayAvatarURL({ dynamic: true, size: 4096 }))
                .replace(/{user\.name}/gi, member.user.username)
                .replace(/{user\.id}/gi, member.user.id)
                .replace(/{user\.joindate}/gi, member.joinedAt)
                .replace(/{user\.nick}/gi, member.nickname ? member.nickname : 'No tiene Apodo.')
                .replace(/{user\.createdate}/gi, member.user.createdAt)
                .replace(/{server\.prefix}/gi, prefix)
                .replace(/{server}/gi, member.guild.name)
                .replace(/{server\.id}/gi, member.guild.id)
                .replace(/{server\.membercount}/gi, member.guild.members.cache.size)
                .replace(/{server\.membercount\.nobots}/gi, member.guild.members.cache.filter(miembro => !miembro.user.bot).size)
                .replace(/{server\.membercount\.bots}/gi, member.guild.members.cache.filter(miembro => miembro.user.bot).size)
                .replace(/{server\.rolecount}/gi, member.guild.roles.cache.size)
                .replace(/{server\.channelcount}/gi, member.guild.channels.cache.size)
                .replace(/{server\.channelcount\.text}/gi, member.guild.channels.cache.filter((a) => a.type === 'text').size)
                .replace(/{server\.channelcount\.voice}/gi, member.guild.channels.cache.filter((a) => a.type === 'voice').size)
                .replace(/{server\.emojiscount}/gi, member.guild.emojis.cache.size)
                .replace(/{server\.emojiscount\.animate}/gi, member.guild.emojis.cache.filter((a) => a.animated).size)
                .replace(/{server\.emojiscount\.noanimate}/gi, member.guild.emojis.cache.filter((a) => !a.animated).size)
                .replace(/{server\.createdate}/gi, member.guild.createdAt)
                .replace(/{server\.boostlevel}/gi, member.guild.premiumTier)
                .replace(/{server\.boostcount}/gi, member.guild.premiumSubscriptionCount)
                .replace(/{server\.icon}/gi, member.guild.icon ? member.guild.iconURL({ dynamic: true, size: 4096 }) : 'https://cdn.discordapp.com/embed/avatars/0.png?size=2048')
                .replace(/{server\.owner}/gi, owner.user.toString())
                .replace(/{server\.owner\.name}/gi, owner.user.username)
                .replace(/{server\.owner\.id}/gi, owner.user.id)
                .replace(/{server\.owner\.nick}/gi, owner.nickname ? member.guild.owner.nickname : 'No tiene Apodo.')
                .replace(/{server\.owner\.avatar}/gi, owner.user.displayAvatarURL({ size: 4096, dynamic: true }))
                .replace(/{server\.owner\.createdate}/gi, owner.user.createdAt)
                .replace(/{channel}/gi, channel)
                .replace(/{channel\.id}/gi, channel.id)
                .replace(/{channel\.name}/gi, channel.name)
                .replace(/{channel\.createdate}/gi, channel.createdAt);
        }

        async generateEmbed(embedInfo, replaceText) {
            const embed = new Discord.MessageEmbed();
            if (embedInfo.author_text) {
                embedInfo.author_image
                    ? embed.setAuthor(await replaceText(embedInfo.author_text), await replaceText(embedInfo.author_image))
                    : embed.setAuthor(await replaceText(embedInfo.author_text));
            }
            if (embedInfo.title) embed.setTitle(await replaceText(embedInfo.title));
            if (embedInfo.description) embed.setDescription(await replaceText(embedInfo.description));
            if (embedInfo.thumbnail) embed.setThumbnail(await replaceText(embedInfo.thumbnail));
            if (embedInfo.image) embed.setImage(await replaceText(embedInfo.image));

            if (embedInfo.footer_text) {
                embedInfo.footer_image
                    ? embed.setFooter(await replaceText(embedInfo.footer_text), await replaceText(embedInfo.footer_image))
                    : embed.setFooter(await replaceText(embedInfo.footer_text));
            }
            if (embedInfo.timestamp) embed.setTimestamp();
            if (embedInfo.color) embed.setColor('#' + embedInfo.color);

            return embed;
        }
    }
)();