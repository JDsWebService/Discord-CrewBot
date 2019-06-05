// Load Dependancies
const botconfig = require("./bot-config.json");
const tokenconfig = require("./token-config.json");
const Discord = require("discord.js");
const fs = require("fs");

// Create the Bot Instance
const bot = new Discord.Client({disableEveryone: true});

// Make a new Discord Bot Collection for the commands
bot.commands = new Discord.Collection();

// Node File System (Read Directory)
fs.readdir("./commands/", (err, files) => {
	// If there is an error loading the directory
	if(err) console.log(err);

	// Load file names into an array
	let jsfile = files.filter(f => f.split(".").pop() === "js");
	// Check if the array is less then or equal to zero
	if(jsfile.length <= 0) {
		console.log("Couldn't Find Commands!");
		return;
	}

	// Loop through the array
	jsfile.forEach((f, i) => {
		// Require in the file
		let props = require(`./commands/${f}`);
		// Console Log it!
		console.log(`${f} loaded!`);
		// Load the command into the commands instance
		bot.commands.set(props.help.name, props);
	});

});

// Once the bot is online
bot.on("ready", async () => {
	console.log(`${bot.user.username} is online!`);
	bot.user.setActivity("Server", {type: "WATCHING"});
});

// On any message do this!
bot.on("message", async message => {

	// Check if the message is made by the bot or is a DM
	if(message.author.bot) return;
	if(message.channel.type === "dm") return;

	// Split up the message and put it into an array
	let messageArray = message.content.split(" ");
	// Define the command from the array
	let cmd = messageArray[0];
	// Define the prefix that we're looking for
	let prefix = botconfig.prefix;
	// Define the Guild
	let guild = message.guild;
	if (!guild || !guild.available) {
		return console.log("The guild is not availbale.");
	}

	// Check if the prefix is being used in the message
	if(cmd.indexOf(prefix) === 0) {
		// Define the arguments from the command cutting off the command name
		let args = messageArray.slice(1);
		// Get the command logic from the bot commands collection
		let commandLogic = bot.commands.get(cmd.slice(prefix.length));
		// If there is a command, run the logic
		if(commandLogic) commandLogic.run(bot,message,args,guild);
	}
	
});

// Log the bot in!
bot.login(tokenconfig.token);