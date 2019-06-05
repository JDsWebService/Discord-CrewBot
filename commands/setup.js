const Discord = require("discord.js");
const logModule = require("../log.js");
const sqliteModule = require("../sqlite.js");
const log = logModule.log;
const chalk = logModule.chalk;
const sql = sqliteModule.sql;

module.exports.run = async (bot, message, args, guild) => {
	// Check if the member has the Administrator Permission
	if(message.member.hasPermission("ADMINISTRATOR")) {
		// Announce that Setup is going to run
		message.channel.send("Running the Setup!");

		// --------------------
		// Setup Variables
		// --------------------

		let makeCaptainRole = false;
		let makeCrewRole = false;
		let makeCrewsCategory = false;
		let inACrewRole;
		let crewCaptainRole;
		let crewsCategory;

		// --------------------
		// Setup Roles
		// --------------------

		// Crew Captain
		if(!guild.roles.find(role => role.name === 'Crew Captain')) {
			log(chalk.yellow("Crew Captain Role Does Not Exist!"));
			// Set up the Crew Captain Role
			crewCaptainRole = await guild.createRole({
				name: 'Crew Captain',
				color: 'BLUE'
			})
				.then(value => {
					log(chalk.green(`Created new role with name ${value.name}`));
					makeCaptainRole = true;
					return value;
				})
				.catch(console.error);
			log(crewCaptainRole.id);
		} else {
			crewCaptainRole = guild.roles.find(role => role.name === 'Crew Captain');
			log(chalk.red("Crew Captain Role Already Exists!"));
		}

		// In A Crew Role
		if(!guild.roles.find(role => role.name === 'In A Crew')) {
			log(chalk.yellow("In A Crew Role Does Not Exist!"));
			// Set up the Crew Captain Role
			inACrewRole = await guild.createRole({
				name: 'In A Crew'
			})
				.then(value => {
					log(chalk.green(`Created new role with name ${value.name}`));
					makeCrewRole = true;
					return value;
				})
				.catch(console.error);
			log(inACrewRole.id);
		} else {
			inACrewRole = guild.roles.find(role => role.name === 'In A Crew');
			log(chalk.red("In A Crew Role Already Exists!"));
		}


		// --------------------
		// Setup Crews Category
		// --------------------
		crewsCategory = guild.channels.find(channel => channel.name === 'crews');
		if(!crewsCategory || crewsCategory.type !== 'category') {
			log(chalk.yellow('Crews Category Does Not Exist!'));
			await guild.createChannel('crews', {
				type: 'category',
				permissionOverwrites: [
					{
						id: guild.defaultRole.id,
						deny: ['VIEW_CHANNEL'],
					},
					{
						id: inACrewRole.id,
						allow: ['VIEW_CHANNEL'],
					},
				]
			})
			  .then(function() {
			  	log(chalk.green("Crews Category Created!"));
			  	makeCrewsCategory = true;
			  })
			  .catch(console.error);
			  
		} else if(crewsCategory.type === 'category') {
			log(chalk.red("Crews Category Already Exists!"));
		}

		// --------------------
		// Setup SQLite Table
		// --------------------
		const table = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'crews';").get();
		if (!table['count(*)']) {
			// If the table isn't there, create it and setup the database correctly.
			sql.prepare("CREATE TABLE crews (id TEXT PRIMARY KEY, user TEXT, guild TEXT, crewName TEXT);").run();
			// Ensure that the "id" row is always unique and indexed.
			sql.prepare("CREATE UNIQUE INDEX idx_crews_id ON crews (id);").run();
			sql.pragma("synchronous = 1");
			sql.pragma("journal_mode = wal");
			// Echo Logs
			log(chalk.green("SQLite Setup!"));
			message.channel.send("SQLite has been setup!");
		} else {
			log(chalk.red("SQLite has already been setup!"));
			message.channel.send("SQLite has already been setup!");
		}

		


		// --------------------
		// Boolean Values Check
		// --------------------
		
		// Crew Captain Role
		if(makeCaptainRole === false) {
			message.channel.send("Crew Captain Role has already been made!");
		}

		// In A Crew Role
		if(makeCrewRole === false) {
			message.channel.send("In A Crew Role has already been made!");
		}

		// Crews Category
		if(makeCrewsCategory === false) {
			message.channel.send("Crews Category has already been made!");
		}


		


	} else {
		log("No Permission To Run Setup!");
		message.channel.send("No Permission To Run Setup!");
	}
	
	
}

module.exports.help = {
	name: "setup"
}