// Require the Discord Client
const Discord = require("discord.js");

// Import Log Module
const logModule = require("../log.js");
const log = logModule.log;
const chalk = logModule.chalk;

module.exports.run = async (bot, message, args, guild) => {


	// Return
	return message.channel.send("pong");
}

module.exports.help = {
	name: "ping"
}