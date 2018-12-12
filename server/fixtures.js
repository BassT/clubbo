/*global
    Clubs, Departments, Teams, Absences, SimpleSchema, Meteor, Accounts, Roles, Tags, moment, Events, Responses, _
 */

SimpleSchema.debug = true;

var demoTeamId, demoAdminId, demoUser1Id, demoUser2Id;

if (Teams.find().count() === 0) {
  demoTeamId = Teams.insert({
    name: "Demo-Team"
  });
}

if (Meteor.users.find().count() === 0) {
  demoAdminId = Accounts.createUser({
    email: "admin@clubbo.org",
    password: "password",
    profile: {
      firstName: "Admin",
      lastName: "Demo",
      teamIds: [demoTeamId],
      positions: ["A"]
    }
  });

  demoUser1Id = Accounts.createUser({
    email: "user1@clubbo.org",
    password: "password",
    profile: {
      firstName: "UserOne",
      lastName: "Demo",
      teamIds: [demoTeamId],
      positions: ["A"]
    }
  });

  demoUser2Id = Accounts.createUser({
    email: "user2@clubbo.org",
    password: "password",
    profile: {
      firstName: "UserTwo",
      lastName: "Demo",
      teamIds: [demoTeamId],
      positions: ["A"]
    }
  });

  Teams.update(demoTeamId, {
    $set: { userIds: [demoAdminId, demoUser1Id, demoUser2Id] }
  });

  Roles.addUsersToRoles([demoAdminId], ["admin"], demoTeamId);
}

if (Events.find().count() === 0) {
  Events.insert({
    start: moment()
      .startOf("hour")
      .format(),
    end: moment()
      .endOf("day")
      .format(),
    title: "Today event (Demo)",
    responseRequired: true,
    background: false,
    teamId: demoTeamId
  });
}
