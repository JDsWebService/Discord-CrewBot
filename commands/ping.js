const Discord = require("discord.js");

module.exports.run = async (bot, message, args, guild) => {
	return message.channel.send("pong");
}

module.exports.help = {
	name: "ping"
}