// Require the Discord Client
const Discord = require("discord.js");

// Import Log Module
const logModule = require("../log.js");
const log = logModule.log;
const chalk = logModule.chalk;

// Import SQLite Module
const sqliteModule = require("../sqlite.js");
const sql = sqliteModule.sql;
const userCrew = sqliteModule.userCrew;
const addNewCrew = sqliteModule.addNewCrew;
const addNewCrewMember = sqliteModule.addNewCrewMember;
const deleteCrewMember = sqliteModule.deleteCrewMember;
const deleteCrew = sqliteModule.deleteCrew;

module.exports.run = async (bot, message, args, guild) => {

	// --------------------
	// Test SQL Pre-Made Queries
	// --------------------

	if(addNewCrew(12, "Fine Crew", 34, 56)) {
		log(chalk.green("Added Crew To Database!"));
	} else {
		log(chalk.red("SQL Failed!"));
	}

	if(addNewCrewMember(12, 3234234, 0)) {
		log(chalk.green("Added Crew Member To Database!"));
	} else {
		log(chalk.red("SQL Failed!"));
	}

	if(deleteCrewMember(353, 3234234)) {
		log(chalk.green("Deleted Crew Member From Database!"));
	} else {
		log(chalk.red("SQL Failed!"));
	}

	if(deleteCrew(12, 56)) {
		log(chalk.green("Deleted Crew From Database!"));
	} else {
		log(chalk.red("SQL Failed!"));
	}


	return message.channel.send("pong");
}

module.exports.help = {
	name: "ping"
}