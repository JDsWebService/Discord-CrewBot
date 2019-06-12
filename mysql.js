// Require Some Stuff
const mysql = require('mysql');

// Import Log Module
const logModule = require("./log.js");
const log = logModule.log;
const chalk = logModule.chalk;

// Define Variables
let env = 'prod';
let connectionInfo;

if(env !== 'dev') {
	// --------------------
	// Heroku MySQL Connection
	// --------------------
	connectionInfo = process.env.CLEARDB_DATABASE_URL;
} else {
	// --------------------
	// Localhost MySQL Information
	// --------------------
	const tokenConfig = require('./token-config.json');
	connectionInfo = {
		host: tokenConfig.mysql.development.host,
		user: tokenConfig.mysql.development.user,
		password: tokenConfig.mysql.development.password,
		database: tokenConfig.mysql.development.database
	}
}

// --------------------
// Create MySQL Pool
// --------------------
const pool = mysql.createPool(connectionInfo);

// Check Connection
pool.getConnection(function(err, connection) {
	if(err) {
		log(chalk.red("(mysql.js:userCrewMemberSearch) - Connection Error"));
		return console.log(err);
	}
})

// --------------------
// Setup Pre-Made SQL Queries
// --------------------
log(chalk.blue("(mysql.js) - Loading pre-made MySQL Queries..."));

// --------------------
// User Crew Member Search
// --------------------
function userCrewMemberSearch(guildID, userID, callback) {
	// Find the CrewMember by guildID and userID
	sql = "SELECT * FROM \`crew-members\` WHERE guildID = ? AND userID = ?;";
	pool.getConnection(function(err, connection) {
		// If MySQL Connection Error
		if(err) {
			log(chalk.red("(mysql.js:userCrewMemberSearch) - Connection Error"));
			return console.log(err);
		}

		// Run the query
		connection.query(sql, [guildID, userID], function(err, results) {
			// Release the connection
			connection.release();
			// If Query Error
			if(err) {
				log(chalk.red("(mysql.js:userCrewMemberSearch) - Query Error"));
				return console.log(err);
			}

			// Query Successful
			log(chalk.green("(mysql.js:userCrewMemberSearch) - Query Completed!"));
			crewMember = results[0];
			return callback(crewMember);
		});
	});
} // End User Crew Member Search

// --------------------
// User Crew Search
// --------------------
function userCrewSearch(guildID, userID, callback) {

	userCrewMemberSearch(guildID, userID, function(result) {
		// Now Find the Crew Members Crew
		sql = "SELECT * FROM \`crews\` WHERE id = ? AND guildID = ?";
		pool.getConnection(function(err, connection) {
			if(err) {
				log(chalk.red("(mysql.js:userCrewSearch) - Connection Error"));
				return console.log(err);
			}
			// Run the query
			connection.query(sql, [result.crewID, guildID], function(err, results) {
				// Release the connection
				connection.release();
				// If Query Error
				if(err) {
					log(chalk.red("(mysql.js:userCrewSearch) - Query Error"));
					return console.log(err);
				}

				// Query Successful
				log(chalk.green("(mysql.js:userCrewSearch) - Query Completed!"));
				userCrew = results[0];
				return callback(userCrew);
			});
		});
	});
} // End User Crew Search

// --------------------
// Add New Crew
// --------------------
function addNewCrew(guildID, crewName, crewCaptainUserID, crewRoleID, callback) {

	// Insert the crew into the crews table
	sql = "INSERT INTO crews (guildID, crewName, crewCaptainUserID, crewRoleID) VALUES (?, ?, ?, ?);";
	pool.getConnection(function(err, connection) {
		// If MySQL Connection Error
		if(err) {
			log(chalk.red("(mysql.js:addNewCrew) - Connection Error"));
			console.log(err);
			return callback(false);
		}

		// Run the query
		connection.query(sql, [guildID, crewName, crewCaptainUserID, crewRoleID], function(err, results) {
			// Release the connection
			connection.release();
			// If Query Error
			if(err) {
				log(chalk.red("(mysql.js:addNewCrew) - Query Error"));
				console.log(err);
				return callback(false);
			}

			// Query Successful
			log(chalk.green("(mysql.js:addNewCrew) - Query Completed!"));
			return callback(true);
		});
	});

} // End Add New Crew

// --------------------
// Add New Crew Member
// --------------------
function addNewCrewMember(guildID, crewID, userID, captain, callback) {

	// Insert the crew into the crews table
	sql = "INSERT INTO `crew-members` (guildID, crewID, userID, captain) VALUES (?, ?, ?, ?);";
	pool.getConnection(function(err, connection) {
		// If MySQL Connection Error
		if(err) {
			log(chalk.red("(mysql.js:addNewCrewMember) - Connection Error"));
			console.log(err);
			return callback(false);
		}

		// Run the query
		connection.query(sql, [guildID, crewID, userID, captain], function(err, results) {
			// Release the connection
			connection.release();
			// If Query Error
			if(err) {
				log(chalk.red("(mysql.js:addNewCrewMember) - Query Error"));
				console.log(err);
				return callback(false);
			}

			// Query Successful
			log(chalk.green("(mysql.js:addNewCrewMember) - Query Completed!"));
			return callback(true);
		});
	});

} // End Add New Crew Member

// --------------------
// Delete Crew Member
// --------------------
function deleteCrewMember(crewID, userID, callback) {

	// Insert the crew into the crews table
	sql = "DELETE FROM `crew-members` WHERE crewID = ? AND userID = ?;";
	pool.getConnection(function(err, connection) {
		// If MySQL Connection Error
		if(err) {
			log(chalk.red("(mysql.js:deleteCrewMember) - Connection Error"));
			console.log(err);
			return callback(false);
		}

		// Run the query
		connection.query(sql, [crewID, userID], function(err, results) {
			// Release the connection
			connection.release();
			// If Query Error
			if(err) {
				log(chalk.red("(mysql.js:deleteCrewMember) - Query Error"));
				console.log(err);
				return callback(false);
			}

			// Query Successful
			log(chalk.green("(mysql.js:deleteCrewMember) - Query Completed!"));
			return callback(true);
		});
	});

} // End Delete Crew Member

// --------------------
// Delete Crew
// --------------------
function deleteCrew(guildID, crewRoleID, callback) {

	// Insert the crew into the crews table
	sql = "DELETE FROM `crews` WHERE guildID = ? AND crewRoleID = ?;";
	pool.getConnection(function(err, connection) {
		// If MySQL Connection Error
		if(err) {
			log(chalk.red("(mysql.js:deleteCrew) - Connection Error"));
			console.log(err);
			return callback(false);
		}

		// Run the query
		connection.query(sql, [guildID, crewRoleID], function(err, results) {
			// Release the connection
			connection.release();
			// If Query Error
			if(err) {
				log(chalk.red("(mysql.js:deleteCrew) - Query Error"));
				console.log(err);
				return callback(false);
			}

			// Query Successful
			log(chalk.green("(mysql.js:deleteCrew) - Query Completed!"));
			return callback(true);
		});
	});

} // End Delete Crew

// --------------------
// Find Crew ID
// --------------------
function findCrewID(guildID, crewName, callback) {

	// Insert the crew into the crews table
	sql = "SELECT id FROM crews WHERE guildID = ? AND crewName = ?;";
	pool.getConnection(function(err, connection) {
		// If MySQL Connection Error
		if(err) {
			log(chalk.red("(mysql.js:findCrewID) - Connection Error"));
			console.log(err);
			return callback(false);
		}

		// Run the query
		connection.query(sql, [guildID, crewName], function(err, results) {
			// Release the connection
			connection.release();
			// If Query Error
			if(err) {
				log(chalk.red("(mysql.js:findCrewID) - Query Error"));
				console.log(err);
				return callback(false);
			}

			// Query Successful
			log(chalk.green("(mysql.js:findCrewID) - Query Completed!"));
			return callback(results);
		});
	});

} // End Find Crew ID

// --------------------
// Transfer Leadership
// --------------------
function transferLeadership(guildID, captainID, userID, crewRoleID, callback) {

	// Prepare the SQL Statement
	sql = "UPDATE `crew-members` SET captain = ? WHERE guildID = ? AND userID = ?;";

	// Get the Database Connection
	pool.getConnection(function(err, connection) {
		// If MySQL Connection Error
		if(err) {
			log(chalk.red("(mysql.js:transferLeadership@captain) - Connection Error"));
			console.log(err);
			return callback(false);
		}

		// Run the Captain User query
		connection.query(sql, [0, guildID, captainID], function(err, results) {
			// If Query Error
			if(err) {
				log(chalk.red("(mysql.js:transferLeadership@captain) - Query Error"));
				console.log(err);
				return callback(false);
			}
			// Query Successful
			log(chalk.green("(mysql.js:transferLeadership@captain) - Query Completed!"));
		});

		// Run the User query
		connection.query(sql, [1, guildID, userID], function(err, results) {
			// If Query Error
			if(err) {
				log(chalk.red("(mysql.js:transferLeadership@user) - Query Error"));
				console.log(err);
				return callback(false);
			}
			// Query Successful
			log(chalk.green("(mysql.js:transferLeadership@user) - Query Completed!"));
		});

		sql = "UPDATE `crews` SET crewCaptainUserID = ? WHERE guildID = ? AND crewRoleID = ?;";

		connection.query(sql, [userID, guildID, crewRoleID], function(err, results) {
			if(err) {
				log(chalk.red("(mysql.js:transferLeadership@crewUpdate) - Query Error"));
				console.log(err);
				return callback(false);
			}
			// Query Successful
			log(chalk.green("(mysql.js:transferLeadership@crewUpdate) - Query Completed!"));
		});


		// Release the connection
		connection.release();
	}); // End Pool Connection

	// Everything went well!
	log(chalk.green("(mysql.js:transferLeadership) - Users Have Switched Roles!"));
	return callback(true);

} // End Transfer Leadership


// Export MySQL Module
module.exports = {
	userCrewSearch: userCrewSearch,
	addNewCrew: addNewCrew,
	addNewCrewMember: addNewCrewMember,
	deleteCrewMember: deleteCrewMember,
	deleteCrew: deleteCrew,
	findCrewID: findCrewID,
	transferLeadership: transferLeadership,
};