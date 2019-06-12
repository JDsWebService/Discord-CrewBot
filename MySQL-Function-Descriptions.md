# MySQL Functions

## userCrewMemberSearch(guildID, userID, callback)

Searches for the user in the Crew. This directly accesses the `crew-members` table from the MySQL database.

### Parameters

#### guildID
	Type: String
	References: Discord Guild ID
	Description: Can be retrieved using "guild.id"
#### userID
	Type: String
	References: Discord Guild Member ID
	Description: Can be retrived using "guild.member.id"
#### callback (r)
	Type: Callback
	Returns: RowDataPacket
	Description: Returns the value of a MySQL SELECT Query using the supplied parameters. This function is to return an instance of a crew member inside the MySQL Database from the crew-members table.

## userCrewSearch(guildID, userID, callback)

Searches for use crew members Crew. This directly accesses the `crew` table from the MySQL database.

### Parameters

#### guildID
	Type: String
	References: Discord Guild ID
	Description: Can be retrieved using "guild.id"
#### userID
	Type: String
	References: Discord Guild Member ID
	Description: Can be retrived using "guild.member.id"
#### callback (r)
	Type: Callback
	Returns: RowDataPacket
	Description: Returns the value of a MySQL SELECT Query using the supplied parameters. This function is to return an instance of a crew inside the MySQL Database from the crews table.
	
## addNewCrew(guildID, crewName, crewCaptainUserID, crewRoleID, callback)

Adds a new Crew to the MySQL database, and inserts a row into the `crews` table.

### Parameters

#### guildID
	Type: String
	References: Discord Guild ID
	Description: Can be retrieved using "guild.id"
	
#### crewName
	Type: String
	References: Crew Name
	Description: This value is specified by the User running the '~crew create <crewName>' command.
	
#### crewCaptainUserID
	Type: String
	References: Discord Guild Member ID
	Description: Can be retrived using "guild.member.id" or user running the command "message.member.id".
	
#### crewRoleID
	Type: String
	References: Discord Crew Role ID
	Description: Can be retrieved using the "guild.roles.find(v=>v.name == $name)" collection function.
	
#### callback (r)
	Type: Callback
	Returns: Boolean
	Description: Returns a boolean value. True if the addition to the table is successful, false if there was an error.

## addNewCrewMember(guildID, crewID, userID, captain, callback)

## deleteCrewMember(crewID, userID, callback)

## deleteCrew(guildID, crewRoleID, callback)
 
## findCrewID(guildID, crewName, callback)

## transferLeadership(guildID, captainID, userID, callback)