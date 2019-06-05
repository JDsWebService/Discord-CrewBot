const SQLite = require("better-sqlite3");
const sql = new SQLite('./crews.sqlite');

const logModule = require("./log.js");
const log = logModule.log;
const chalk = logModule.chalk;

let error = false;
let userCrewSearch;
let userCrewAdd;
let userRemove;

const table = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'crews';").get();
if (!table['count(*)']) {
	log(chalk.red("SQLite not setup! Run setup command first!"));
	error = true;
} else {
	// Then we have two prepared statements for the crews table
	userCrewSearch = sql.prepare("SELECT * FROM crews WHERE user = ? AND guild = ?;");
	userCrewAdd = sql.prepare("INSERT OR REPLACE INTO crews (id, user, guild, crewName) VALUES (@id, @user, @guild, @crewName);");
	userRemove = sql.prepare("DELETE FROM crews WHERE user = ? AND guild = ?;");
}

// Export Log Module
module.exports = {
	sql: sql,
	sqlError: error,
	userCrewSearch: userCrewSearch,
	userCrewAdd: userCrewAdd,
	userRemove: userRemove
};