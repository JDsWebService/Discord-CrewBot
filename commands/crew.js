const Discord = require("discord.js");
const logModule = require("../log.js");
const log = logModule.log;
const chalk = logModule.chalk;

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
		log("");
		log(chalk.green("*******************"));
		log(chalk.green("Crew Creation"))
		log(chalk.green("*******************"));

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

		} else {
			log(chalk.red(`${crewName} already exists!`));
			message.channel.send(`${crewName} already exists! Try again with a different name!`);
		}
		
	} // End Create
	
	
}

module.exports.help = {
	name: "crew"
}