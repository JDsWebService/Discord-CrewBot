const Discord = require("discord.js");

module.exports.run = async (bot, message, args, guild) => {
	console.log(args);

	// --------------------
	// Setup Variables
	// --------------------
	let crewName;
	let makeCrewRole;

	// --------------------	
	// Create Command
	// --------------------
	if(args[0] == 'create') {	
		
		// Capitalize First Letter In Each String in Args Array
		for(var i = 1 ; i < args.length ; i++){
		    args[i] = args[i].charAt(0).toUpperCase() + args[i].substr(1);
		}
		// Define the crewName
		crewName = args.join(" ").slice(7);
		console.log('Crew Name: ' + crewName);

		// check to see if crew name exists
		if(!guild.roles.find(role => role.name === crewName)) {
			console.log(`${crewName} Does Not Exist, Creating Now!`);

			// Create Role
			crewRole = await guild.createRole({
				name: crewName,
			})
				.then(value => {
					console.log(`Created new role with name ${value.name}`);
					makeCrewRole = true;
					return value;
				})
				.catch(console.error);
			console.log(crewRole.id);
			
			// Create Text Chat
			// Create Voice Chat
		} else {
			message.channel.send(`${crewName} already exists! Try again with a different name!`);
		}
		

		
	} // End Create
	
	
}

module.exports.help = {
	name: "crew"
}