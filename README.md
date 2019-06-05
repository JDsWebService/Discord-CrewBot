# Commands

## Admin Only

`setup` - Set's up the discord server for use of the CrewBot. Only run this command once.

`reinstall` - Resets the entire discord and erases all crews.

## User Front Facing

`crew create <crewName>` - creates a new Crew as specified by the user

`crew add @<user>` - Adds the user to the Crew.

`crew disband` - Deletes the crew. Must have the Crew Captain Role to issue this command.

`crew transfer @<user>` - Transfers the Crew Captain Role to another user. Must have the Crew Captain Role to transfer the role.

`crew kick @<user>` - Kick the user out of the Crew. Must have the Crew Captain Role.

`crew leave` - Leave the Crew. If you are the Crew Captain, it automatically transfers the Crew Captain Role to someone else in the Crew at random.

## Pseudo Code

`setup`

- Creates the "Crews" Category
- Creates the "Crew Captain" Role
- Creates the "In A Crew" Role

`crew create <crewName>`

- Checks if the user is in a Crew already
- Checks if the Crew Exists
- Creates the Crew Role
- Assign the Crew Captain Role to the User
- Creates the Crew Voice Chat
- Creates the Crew Text Chat
- Makes sure that ONLY the Crew can view these channels