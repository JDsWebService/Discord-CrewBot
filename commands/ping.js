const Discord = require("discord.js");
const logModule = require("../log.js");
const log = logModule.log;
const chalk = logModule.chalk;

module.exports.run = async (bot, message, args, guild) => {
	return message.channel.send("pong");
}

module.exports.help = {
	name: "ping"
}