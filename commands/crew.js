// Require the Discord Client
const Discord = require("discord.js");

// Import Log Module
const logModule = require("../log.js");
const log = logModule.log;
const chalk = logModule.chalk;

// Import SQLite Module
const sqliteModule = require("../sqlite.js");
const sql = sqliteModule.sql;
const userCrewSearch = sqliteModule.userCrewSearch;
const addNewCrew = sqliteModule.addNewCrew;
const addNewCrewMember = sqliteModule.addNewCrewMember;
const deleteCrewMember = sqliteModule.deleteCrewMember;
const deleteCrew = sqliteModule.deleteCrew;
const findCrewID = sqliteModule.findCrewID;
const transferLeadership = sqliteModule.transferLeadership;

module.exports.run = async (bot, message, args, guild) => {
	// Debug Args
	log(chalk.blue("------------------------"));
	log(chalk.blue('Command Arguments - ' + args));
	log(chalk.blue("------------------------"));

	// --------------------
	// Setup Variables
	// --------------------
	let crewName;
	let sqlQuery;
	let crewSQLID;
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
			log(chalk.blue("Crew Role ID: " + crewRole.id));

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

			// Add the Crew to the Database
			sqlQuery = addNewCrew(guild.id, crewName, user.id, crewRole.id);
			if(sqlQuery) {
				log(chalk.green("Added Crew To Database!"));
			} else {
				log(chalk.red("SQL Failed!"));
			}

			// Find the Crew ID from the Database
			crewSQLID = findCrewID(guild.id, crewName);

			// Add new Crew Member to the Database
			sqlQuery = addNewCrewMember(guild.id, crewSQLID, user.id, 1);
			if(sqlQuery) {
				log(chalk.green("Added Crew Member To Database!"));
			} else {
				log(chalk.red("SQL Failed!"));
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

		log(chalk.green("*******************"));
		log(chalk.green("Crew Disband"))
		log(chalk.green("*******************"));
		log("");

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
		let userCrewName = userCrewSearch(guild.id, message.author.id).crewName;
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

				// Find the CrewID
				crewSQLID = findCrewID(guild.id, userCrewName);

				// Delete Crew Member from Database
				if(deleteCrewMember(crewSQLID, member.user.id)) {
					log(chalk.green("Deleted Crew Member From Database!"));
				} else {
					log(chalk.red("SQL Failed!"));
				}
			} else {
				// The user does not have the Captain Role, so just remove the other roles
				log(chalk.blue("Removing other roles - Outside Captain Role"));
				member.removeRoles([userCrewRole.id, inACrewRole.id])
				    	.then(function() {
							log(chalk.green(`Removed Crew Specific Role & In A Crew Role from user ${member.user.tag}!`));
						})
						.catch(console.error);

				// Find the CrewID
				crewSQLID = findCrewID(guild.id, crewName);

				// Delete Crew Member from Database
				if(deleteCrewMember(crewSQLID, member.user.id)) {
					log(chalk.green("Deleted Crew Member From Database!"));
				} else {
					log(chalk.red("SQL Failed!"));
				}
			}

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

		// Handle Some SQL Database Things
		if(deleteCrew(guild.id, userCrewRole.id)) {
			log(chalk.green("Deleted Crew From Database!"));
		} else {
			log(chalk.red("SQL Failed!"));
		}

		// Remove the Crew Specific Role
		userCrewRole.delete()
				.then(function() {
					log(chalk.green("Specific Crew Role Removed!"));
				})
				.catch(console.error);
		
		log(chalk.blue("Done..."));
		// Return Message to Channel
		return message.channel.send("Crew has been disbanded!");

	} // End Disband
	

	// --------------------	
	// Join Command
	// --------------------
	if(args[0] == 'join') {

		log(chalk.green("*******************"));
		log(chalk.green("User Join A Crew"))
		log(chalk.green("*******************"));
		log("");

		// Check if User is in a Crew
		if(user.roles.has(inACrewRole.id)) {
			log(chalk.red("User is already in a crew!"));
			return message.channel.send("You are already in a crew! Use the \`~crew leave\` command before joining a new crew!");
		}

		// Capitalize First Letter In Each String in Args Array
		for(var i = 1 ; i < args.length ; i++){
		    args[i] = args[i].charAt(0).toUpperCase() + args[i].substr(1);
		}
		// Define the crewName
		crewName = args.join(" ").slice(5);
		if(!crewName.includes("Crew")) {
			crewName = crewName + " Crew";
		}
		log(chalk.blue('Crew Name: ' + crewName));

		// check to see if crew name exists
		if(guild.roles.find(role => role.name === crewName)) {

			log(chalk.blue("Crew Exists!"));

			// Find the Crew Text Channel
			textChannel = guild.channels.find(channel => channel.name == crewName.replace(/\s+/g, '-').toLowerCase());
			if(textChannel) {

				log(chalk.green("Sending reply to user!"));
				message.channel.send("Your request has been sent to the Crew! Please wait patiently for their reply!");

				log(chalk.green("Sending Message to Crew Chat!"));
				textChannel.send("<@" + user.user.id + "> is requesting to join your crew! Use the \`~crew add @<userName>\` command to add them to your crew!");
			} else {
				log(chalk.red("Can Not Find Crew Text Channel!"));
				return message.channel.send("Can Not Find Text Channel for the Crew! Contact an Administrator!");
			}


		} else {
			log(chalk.red("Crew Does Not Exist!"));
			return message.channel.send(`${crewName} is not a valid crew!`);
		}


	} // End Join Command


	// --------------------	
	// Add Command
	// --------------------
	if(args[0] == 'add') {


		log(chalk.green("*******************"));
		log(chalk.green("Add User To Crew"))
		log(chalk.green("*******************\n"));

		// Find the User's Crew Name from the SQLite Database
		let userCrew = userCrewSearch(guild.id, message.author.id);
		log(chalk.blue("userCrewName: " + userCrew.crewName));

		// Check if User running command is even in a crew
		if(!userCrew) {
			log(chalk.red("User running command is not in a crew"));
			return message.channel.send("You are not in a crew! Run the \`~crew create <crewName>\` command to create a new crew!");
		}

		// Check if User Has the Captain Role
		if(!user.roles.has(captainRole.id)) {
			log(chalk.red("User does not have the Captain Role!"));
			return message.channel.send("You do not have permission to add a crew member to this Crew!");
		}


		// Get tagged user object
		mentionedUser = message.mentions.users.first();
		crewMemberToAdd = await guild.fetchMember(mentionedUser).catch(console.error);

		// Check if Tagged User is in a Crew
		if(crewMemberToAdd.roles.has(inACrewRole.id)) {
			log(chalk.red("User is already in a crew!"));
			return message.channel.send("User is already in a crew! Tell them to use the \`~crew leave\` command before joining a new crew!");
		}

		// Find the Crew's Role to be used later on
		let userCrewRole = guild.roles.find(t => t.name == userCrew.crewName);

		// Check to see if Crew Role Exists
		if(userCrewRole) {

			log(chalk.blue("Crew Role Exists!"));

			// Add User to the Crew Role
			crewMemberToAdd.addRole(userCrewRole)
						.then(function() {
							log(chalk.green("Added the Crew Role to the User!"));

							// Add In A Crew Role
							crewMemberToAdd.addRole(inACrewRole.id)
										.then(function() {
											log(chalk.green("Added In A Crew Role to User!"));
										}).catch(console.error);

							// Add to SQL Table
							addNewCrewMember(guild.id, userCrew.id, crewMemberToAdd.user.id, 0);
							log(chalk.green("Added Crew Member to Crew Members Table in SQLite!"));

							// Find the Crew Text Channel
							textChannel = guild.channels.find(channel => channel.name == userCrew.crewName.replace(/\s+/g, '-').toLowerCase());
							textChannel.send("<@" + crewMemberToAdd.user.id + "> has joined your crew! Say hi!");
							log(chalk.green("Sending Message to Crew Chat!"));

							log(chalk.green("\nUser has been successfully added to the Crew!"));
						})
						.catch(console.error);

		} else {
			log(chalk.red("Crew Does Not Exist!"));
			return message.channel.send(`${crewName} is not a valid crew! -- Add Crew Member Command`);
		}


	} // End Add Command


	// --------------------	
	// Leave Command
	// --------------------
	if(args[0] == 'leave') {

		log(chalk.green("*******************"));
		log(chalk.green("Leave Crew"))
		log(chalk.green("*******************"));
		log("");

		// Find the User's Crew Name from the SQLite Database
		let userCrew = userCrewSearch(guild.id, message.author.id);
		log(chalk.blue("userCrewName: " + userCrew.crewName));

		// Check if User running command is even in a crew
		if(!userCrew) {
			log(chalk.red("User running command is not in a crew"));
			return message.channel.send("You are not in a crew! Run the \`~crew create <crewName>\` command to create a new crew!");
		}

		// Check if User Has the Captain Role
		if(user.roles.has(captainRole.id)) {
			log(chalk.red("User has the Crew Captain Role!"));
			return message.channel.send("You are a Crew Captain! Use the \`~crew disband\` command to disband the crew, or transfer your crew first using the \`~crew transfer @<userName>\` command, then try and run this command again.");
		}

		user = message.member;

		// Find the Crew's Role to be used later on
		let userCrewRole = guild.roles.find(t => t.name == userCrew.crewName);

		user.removeRole(userCrewRole)
				.then(function() {

					user.removeRole(inACrewRole.id).catch(console.error);
					
					// Remove Crew From Crew Members Table
					sqlQuery = deleteCrewMember(userCrew.id, user.user.id);
					if(!sqlQuery) {
						log(chalk.red("Could not remove crew member from crew-members table"));
						return messsage.channel.send("Something went wrong when removing crew from SQLite Database");
					} else {
						log(chalk.green("Removed Crew Member from Crew Members Table in SQLite Database"));
					}

					// Find the Crew Text Channel
					textChannel = guild.channels.find(channel => channel.name == userCrew.crewName.replace(/\s+/g, '-').toLowerCase());
					// Send a Message to the Crew
					textChannel.send("<@" + user.user.id + "> has left your crew!");
					log(chalk.green("Sending Message to Crew Chat!"));

					message.channel.send("You have left your crew!");

					log(chalk.green("Crew Role has been removed from user"));
				}).catch(console.error);

	} // End Leave Command



	// --------------------	
	// Kick Command
	// --------------------
	if(args[0] == 'kick') {


		log(chalk.green("*******************"));
		log(chalk.green("Kick Crew Member"))
		log(chalk.green("*******************\n"));

		// Find the User's Crew Name from the SQLite Database
		let userCrew = userCrewSearch(guild.id, message.author.id);
		log(chalk.blue("userCrewName: " + userCrew.crewName));

		// Check if User running command is even in a crew
		if(!userCrew) {
			log(chalk.red("User running command is not in a crew"));
			return message.channel.send("You are not in a crew! Run the \`~crew create <crewName>\` command to create a new crew!");
		}

		// Check if User Has the Captain Role
		if(!user.roles.has(captainRole.id)) {
			log(chalk.red("User does not have the Captain Role!"));
			return message.channel.send("You do not have permission to kick a crew member from this Crew!");
		}

		// Get tagged user object
		mentionedUser = message.mentions.users.first();
		crewMemberToRemove = await guild.fetchMember(mentionedUser).catch(console.error);

		// Check if tagged user is self
		if(crewMemberToRemove.id == message.author.id) {
			log(chalk.yellow("User is trying to remove him/her self from crew"));
			return message.channel.send("You can't remove yourself from the Crew using this command. Use \`~crew leave\` instead!");
		}

		// Find the Crew's Role to be used later on
		let userCrewRole = guild.roles.find(t => t.name == userCrew.crewName);

		// Check if Tagged User is in a This Crew
		if(!crewMemberToRemove.roles.has(userCrewRole.id)) {
			log(chalk.red("User isn't apart of this crew!"));
			return message.channel.send("User is not even in this Crew!");
		}

		// Check to see if Crew Role Exists
		if(userCrewRole) {

			log(chalk.blue("Crew Role Exists!"));

			// Remove User to the Crew Role
			crewMemberToRemove.removeRole(userCrewRole)
						.then(function() {
							log(chalk.green("Removed the Crew Role to the User!"));

							// Remove In A Crew Role
							crewMemberToRemove.removeRole(inACrewRole.id)
										.then(function() {
											log(chalk.green("Removed In A Crew Role from User!"));
										}).catch(console.error);

							// Remove from SQL Table
							deleteCrewMember(userCrew.id, crewMemberToRemove.user.id);
							log(chalk.green("Removed Crew Member from Crew Members Table in SQLite!"));

							// Find the Crew Text Channel
							textChannel = guild.channels.find(channel => channel.name == userCrew.crewName.replace(/\s+/g, '-').toLowerCase());
							textChannel.send(crewMemberToRemove.user.username + " has been removed from your crew!");
							log(chalk.green("Sending Message to Crew Chat!"));

							log(chalk.green("\nUser has been successfully removed from the Crew!"));
						})
						.catch(console.error);

		} else {
			log(chalk.red("Crew Does Not Exist!"));
			return message.channel.send(`${crewName} is not a valid crew!`);
		}

	} // End Kick Command


	// --------------------	
	// Transfer Command
	// --------------------
	if(args[0] == 'transfer') {

		log(chalk.green("*******************"));
		log(chalk.green("Crew Transfer"))
		log(chalk.green("*******************\n"));

		// Find the User's Crew Name from the SQLite Database
		let userCrew = userCrewSearch(guild.id, message.author.id);
		log(chalk.blue("userCrewName: " + userCrew.crewName));

		// Find the Crew's Role to be used later on
		let userCrewRole = guild.roles.find(t => t.name == userCrew.crewName);

		// Get tagged user object
		mentionedUser = message.mentions.users.first();
		crewMemberToTransfer = await guild.fetchMember(mentionedUser).catch(console.error);

		// Check if User is in a Crew
		if(!user.roles.has(inACrewRole.id)) {
			log(chalk.red("User is not in a crew!"));
			return message.channel.send("You are not in a crew!");
		}

		// Check if User Has the Captain Role
		if(!user.roles.has(captainRole.id)) {
			log(chalk.red("User does not have the Captain Role!"));
			return message.channel.send("You do not have permission to transfer this Crew!");
		}

		// Check if tagged user is self
		if(crewMemberToTransfer.id == message.author.id) {
			log(chalk.yellow("User is trying to transfer to him/her self"));
			return message.channel.send("You can't transfer the crew to yourself! You're already the Crew Captain!");
		}

		// Check if Tagged User is in a This Crew
		if(!crewMemberToTransfer.roles.has(userCrewRole.id)) {
			log(chalk.red("User isn't apart of this crew!"));
			return message.channel.send("User is not in your Crew! Add the to the Crew using the \`~crew add @<userName>\` command!");
		}

		// Change the Roles
		crewMemberToTransfer.addRole(captainRole.id)
			.then(function() {
				
				log(chalk.green("Crew Captain Role Assigned to Tagged User"));

				message.member.removeRole(captainRole.id)
							.then(function() {
								log(chalk.green("Crew Captain Role Removed From Message Author"));
							}).catch(console.error);
			}).catch(console.error);

		// Handle SQLite Leadership Change
		if(transferLeadership(guild.id, message.member.id, crewMemberToTransfer.id)) {
			log(chalk.green("SQLite Database has been updated!"));
		}

		// Find the Crew Text Channel
		textChannel = guild.channels.find(channel => channel.name == userCrew.crewName.replace(/\s+/g, '-').toLowerCase());
		log(chalk.green("Sending Message to Crew Chat!"));
		return textChannel.send("Crew Leadership has changed! Say hi to your new Captain <@" + crewMemberToTransfer.user.id +">!");

	} // End Transfer Command



} // End Crew Command

module.exports.help = {
	name: "crew"
}