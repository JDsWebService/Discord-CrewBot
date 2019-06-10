// Import SQLite
const SQLite = require("better-sqlite3");

// Import Log Module
const logModule = require("./log.js");
const log = logModule.log;
const chalk = logModule.chalk;

// --------------------
// Define Variables
// --------------------
let sql;

// --------------------
// Check if Database Exists
// --------------------
try {
	sql = new SQLite('./database.sqlite', {fileMustExist: true});
	log(chalk.green("(sqlite.js) SQLite - Database Setup"));
} catch {
	
	log(chalk.red("(sqlite.js) SQLite - Database Is Not Setup! Running Setup Now!"));
	
	// Setup Database
	sql = new SQLite('./database.sqlite');
	sql.pragma("synchronous = 1");
	sql.pragma("journal_mode = wal");

	log(chalk.green("(sqlite.js) SQLite - Database has been set up successfully!"));
}

// --------------------
// SQLite Tables
// --------------------

// CREWS TABLE
const crewsTable = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'crews';").get();
if (!crewsTable['count(*)']) { // Table has not been setup
	
	log(chalk.yellow("(sqlite.js) SQLite - CREWS Table Not Setup, Creating CREWS table now..."));

	// Create the Table
	sql.prepare("CREATE TABLE 'crews' ( `id` INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE, `guildID` INTEGER, `crewName` TEXT, `crewCaptainUserID` INTEGER, `crewRoleID` INTEGER )").run();

	log(chalk.green("(sqlite.js) SQLite - CREWS table has been setup successfully"));
	
} else { // Table has already been setup
	log(chalk.green("(sqlite.js) SQLite - CREWS table has already been setup!"));
}

// CREW-MEMBERS TABLE
const crewMembersTable = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'crew-members';").get();
if (!crewMembersTable['count(*)']) { // Table has not been setup
	
	log(chalk.yellow("(sqlite.js) SQLite - CREW-MEMBERS Table Not Setup, Creating CREW-MEMBERS table now..."));

	// Create the Table
	sql.prepare("CREATE TABLE 'crew-members' ( `id` INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE, `guildID` INTEGER, `crewID` INTEGER, `userID` INTEGER, `captain` INTEGER )").run();

	log(chalk.green("(sqlite.js) SQLite - CREW-MEMBERS table has been setup successfully"));
	
} else { // Table has already been setup
	log(chalk.green("(sqlite.js) SQLite - CREW-MEMBERS table has already been setup!"));
}


// --------------------
// Setup Pre-Made SQL Queries
// --------------------

log(chalk.blue("(sqlite.js) SQLite - Loading pre-made SQL Queries..."));

// Search for the User's Crew
function userCrewSearch(guildID, userID) {
	crewTable = sql.prepare("SELECT crewID FROM 'crew-members' WHERE userID = " + userID + " AND guildID = " + guildID + ";").get();

	if(!crewTable) {
		return false;
	}

	userCrew = sql.prepare("SELECT * FROM 'crews' WHERE id = " + crewTable.crewID + " AND guildID = " + guildID + ";").get();

	return userCrew;
}

// Add a new Crew
function addNewCrew(guildID, crewName, crewCaptainUserID, crewRoleID) {

	values =  guildID + ", '" + crewName + "', " + crewCaptainUserID + ", " + crewRoleID;
	sqlQuery = sql.prepare("INSERT OR REPLACE INTO 'crews' (guildID, crewName, crewCaptainUserID, crewRoleID) VALUES (" + values + ");").run();

	if(sqlQuery) {
		return true;
	} else {
		return false;
	}

}

// Add New Crew Member
function addNewCrewMember(guildID, crewID, userID, captain = 0) {
	values =  guildID + ", " + crewID + ", " + userID + ", " + captain;
	sqlQuery = sql.prepare("INSERT OR REPLACE INTO 'crew-members' (guildID, crewID, userID, captain) VALUES (" + values + ");").run();

	if(sqlQuery) {
		return true;
	} else {
		return false;
	}
}

// Delete Crew Member
function deleteCrewMember(crewID, userID) {
	sqlQuery = sql.prepare("DELETE FROM 'crew-members' WHERE crewID = '" + crewID + "'AND userID = '" + userID + "';").run();

	if(sqlQuery) {
		return true;
	} else {
		return false;
	}
}

// Delete Crew
function deleteCrew(guildID, crewRoleID) {
	sqlQuery = sql.prepare("DELETE FROM 'crews' WHERE guildID = '" + guildID + "' AND crewRoleID = '" + crewRoleID + "';").run();
	
	if(sqlQuery) {
		return true;
	} else {
		return false;
	}
}

// Find Crew ID
function findCrewID(guildID, crewName) {
	crew = sql.prepare("SELECT * FROM 'crews' WHERE guildID = '" + guildID + "' AND crewName = '" + crewName + "';").get();

	if(crew) {
		return crew.id;
	} else {
		return false;
	}
}

// Transfer Leadership
function transferLeadership(guildID, captainID, userID) {
	sqlQuery = sql.prepare("UPDATE 'crew-members' SET captain = 0 WHERE userID = " + captainID + " AND guildID = " + guildID + ";").run();
	sqlQuery2 = sql.prepare("UPDATE 'crew-members' SET captain = 1 WHERE userID = " + userID + " AND guildID = " + guildID + ";").run();

	if(sqlQuery && sqlQuery2) {
		return true;
	} else {
		return false;
	}
}


// Export Log Module
module.exports = {
	sql: sql,
	userCrewSearch: userCrewSearch,
	addNewCrew: addNewCrew,
	addNewCrewMember: addNewCrewMember,
	deleteCrewMember: deleteCrewMember,
	deleteCrew: deleteCrew,
	findCrewID: findCrewID,
	transferLeadership: transferLeadership,
};