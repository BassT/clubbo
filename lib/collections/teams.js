/*global
    Teams:true, Meteor, SimpleSchema, check, Roles
 */

Teams = new Meteor.Collection("teams");

Teams.attachSchema(
  new SimpleSchema({
    name: {
      type: String
    },
    userIds: {
      type: [String],
      optional: true
    },
    connectedTeamIds: {
      type: [String],
      optional: true
    }
  })
);

Meteor.methods({
  updateTeam: function(team) {
    "use strict";
    if (!this.userId) {
      throw new Meteor.Error(
        "teams.updateTeam.notLoggedIn",
        "Must be logged in."
      );
    }

    if (_.contains(Teams.findOne(team._id).userIds, this.userId)) {
      throw new Meteor.Error(
        "teams.updateTeam.notAnAdmin",
        "Must be an admin."
      );
    }

    Teams.update(team._id, {
      $set: {
        name: team.name
      }
    });
  }
});
