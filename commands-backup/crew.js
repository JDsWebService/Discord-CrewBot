// Requires
const Discord = require("discord.js");
const logModule = require("../log.js");
const sqliteModule = require("../sqlite.js");

// Handle Log Module
const log = logModule.log;
const chalk = logModule.chalk;
// Handle SQLite Module
const sql = sqliteModule.sql;
const userCrewSearch = sqliteModule.userCrewSearch;
const userCrewAdd = sqliteModule.userCrewAdd;
const userRemove = sqliteModule.userRemove;

module.exports.run = async (bot, message, args, guild) => {
	// Debug Args
	log(chalk.blue("------------------------"));
	log(chalk.blue('Command Arguments - ' + args));
	log(chalk.blue("------------------------"));

	// --------------------
	// Setup Variables
	// --------------------
	let crewName;
	let makeCrewRole;
	let crewsCategory;
	let captainRole;
	let inACrewRole;
	let user = guild.member(message.author);

	// --------------------
	// Check Discord Setup
	// --------------------
	crewsCategory = guild.channels.find(channel => channel.name === 'crews');
	inACrewRole = guild.roles.find(role => role.name === 'In A Crew');
	captainRole = guild.roles.find(role => role.name === 'Crew Captain');

	if(!crewsCategory || !inACrewRole || !captainRole) {
		log(chalk.red("Setup Needs To Be Run First!"));
		return message.channel.send("Setup Needs To Be Run First! Contact A Moderator or Admin!");
	}


	// --------------------	
	// Create Command
	// --------------------
	if(args[0] == 'create') {	
		// Console Stuff
		log(chalk.green("*******************"));
		log(chalk.green("Crew Creation"))
		log(chalk.green("*******************"));
		log("");

		// Check if User Is In A Crew
		if(user.roles.has(inACrewRole.id)) {
			log(chalk.red("User is already in a crew!"));
			return message.channel.send("You're already in a crew! Disband or Transfer your crew to someone else to make a new crew!");
		}

		// Capitalize First Letter In Each String in Args Array
		for(var i = 1 ; i < args.length ; i++){
		    args[i] = args[i].charAt(0).toUpperCase() + args[i].substr(1);
		}
		// Define the crewName
		crewName = args.join(" ").slice(7);
		if(!crewName.includes("Crew")) {
			crewName = crewName + " Crew";
		}
		log(chalk.blue('Crew Name: ' + crewName));

		// check to see if crew name exists
		if(!guild.roles.find(role => role.name === crewName)) {
			log(chalk.yellow(`${crewName} Does Not Exist, Creating Now!`));

			// Create Specific Crew Role
			crewRole = await guild.createRole({
				name: crewName,
			})
				.then(value => {
					log(chalk.green(`Created new role with name ${value.name}`));
					makeCrewRole = true;
					return value;
				})
				.catch(console.error);
			log(chalk.blue("Crew ID: " + crewRole.id));

			// Create Text Chat
			await guild.createChannel(crewName, {
				type: 'text',
				permissionOverwrites: [
					{
						id: guild.defaultRole.id,
						deny: ['VIEW_CHANNEL'],
					},
					{
						id: crewRole.id,
						allow: ['VIEW_CHANNEL'],
					},
				],
				parent: crewsCategory
			})
			  .then(function() {
			  	log(chalk.green(`${crewName} Text Channel Created!`));
			  })
			  .catch(console.error);

			// Create Voice Chat
			await guild.createChannel(crewName, {
				type: 'voice',
				permissionOverwrites: [
					{
						id: guild.defaultRole.id,
						deny: ['VIEW_CHANNEL'],
					},
					{
						id: crewRole.id,
						allow: ['VIEW_CHANNEL'],
					},
				],
				parent: crewsCategory
			})
			  .then(function() {
			  	log(chalk.green(`${crewName} Voice Channel Created!`));
			  })
			  .catch(console.error);

			// Assign Crew Captain Role
			user.addRoles([crewRole.id, inACrewRole.id, captainRole.id])
					.then(function() {
						log(chalk.green(user.user.username + ` has been added to the roles for: ${crewName}`));
					})
					.catch(console.error);

			// Add the User to the SQLite Table
			let crewSQLEntry = {
				id: `${message.guild.id}-${message.author.id}`,
				user: message.author.id,
				guild: message.guild.id,
				crewName: crewName,
				crewRoleID: crewRole.id,
				inACrewRoleID: inACrewRole.id,
				captainRoleID: captainRole.id
			}
			runSQL = userCrewAdd.run(crewSQLEntry);
			if(runSQL) {
				log(chalk.green("User & Crew Association added to SQLite"));
				message.channel.send("Crew Created!");
			} else {
				log(chalk.red("Error when creating entry upon crew creation in SQLite"));
				return message.channelsend("Error: SQLite Issue when Creating Crew!");
			}


		} else {
			log(chalk.red(`${crewName} already exists!`));
			return message.channel.send(`${crewName} already exists! Try again with a different name!`);
		}
		
	} // End Create

	// --------------------	
	// Disband Command
	// --------------------
	if(args[0] == 'disband') {

		log("");
		log(chalk.green("*******************"));
		log(chalk.green("Crew Disband"))
		log(chalk.green("*******************"));

		// Check if User is in a Crew
		if(!user.roles.has(inACrewRole.id)) {
			log(chalk.red("User is not in a crew!"));
			return message.channel.send("You are not in a crew!");
		}
		// Check if User Has the Captain Role
		if(!user.roles.has(captainRole.id)) {
			log(chalk.red("User does not have the Captain Role!"));
			return message.channel.send("You do not have permission to disband this Crew!");
		}

		// Find the User's Crew Name from the SQLite Database
		let userCrewName = userCrewSearch.get(message.author.id, message.guild.id).crewName;
		log(chalk.blue("userCrewName: " + userCrewName));

		// Find the Crew's Role to be used later on
		let userCrewRole = guild.roles.find(t => t.name == userCrewName);

		// Loop through each member of the guild
		guild.members.forEach(member => {
			// If the user doesn't have the Specific Crew Role - Skip it
			if(!member.roles.find(t => t.name == userCrewName)) return;
			// If the user has the Crew Captain Role
			if(member.roles.find(t => t.name == "Crew Captain")) {
				log(chalk.blue("User Has Crew Captain Role"));
				// Remove the Crew Captain Role
				member.removeRole(captainRole.id)
						.then(function() {
							log(chalk.green("Removed Crew Captain role from: " + member.user.tag));
							// Then remove the other roles
							log(chalk.blue("Removing other roles - Inside Captain Role"));
							member.removeRoles([userCrewRole.id, inACrewRole.id])
							    	.then(function() {
										log(chalk.green(`Removed Crew Specific Role & In A Crew Role from user ${member.user.tag}!`));
									})
									.catch(console.error);
						})
						.catch(console.error);
			} else {
				// The user does not have the Captain Role, so just remove the other roles
				log(chalk.blue("Removing other roles - Outside Captain Role"));
				member.removeRoles([userCrewRole.id, inACrewRole.id])
				    	.then(function() {
							log(chalk.green(`Removed Crew Specific Role & In A Crew Role from user ${member.user.tag}!`));
						})
						.catch(console.error);
			}

			// Clean Up The SQLite Database
			userRemove.run(member.user.id, guild.id);
			log(chalk.green("Removed User From Database"));

		}); // End Guild Members Loop

		// Delete the Voice Channel for the Crew
		voiceChannel = guild.channels.find(channel => channel.name == userCrewName);
		voiceChannel.delete()
				.then(function () {
					log(chalk.green("Voice Channel Deleted"));
				})
				.catch(console.error);
		
		// Detele the Text Channel for the Crew
		textChannel = guild.channels.find(channel => channel.name == userCrewName.replace(/\s+/g, '-').toLowerCase());
		textChannel.delete()
				.then(function () {
					log(chalk.green("Text Channel Deleted"));
				})
				.catch(console.error);

		// Remove the Crew Specific Role
		guild.roles.find(role => role.name == userCrewName).delete()
				.then(function() {
					log(chalk.green("Specific Crew Role Removed!"));
				})
				.catch(console.error);
		
		log(chalk.blue("Done..."));
		// Return Message to Channel
		return message.channel.send("Crew has been disbanded!");


	} // End Disband
	
	
} // End Crew Command

module.exports.help = {
	name: "crew"
}