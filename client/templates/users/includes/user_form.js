/*global
    Template, $, moment, bootbox, Meteor, Router, Clubs, Roles, Departments, Teams, _, EventsHelper
 */

Template.userForm.onCreated(function() {
  "use strict";
  this.subscribe("teamsByIds", Meteor.user().profile.teamIds);
});

Template.userForm.onRendered(function() {
  "use strict";
  var birthday, positions, i, posCheckboxes, user;

  birthday = $("#birthday");

  birthday.datepicker({
    language: "de"
  });

  if (this.data.user) {
    user = this.data.user;

    if (user.profile.birthday && user.profile.birthday !== "") {
      birthday.datepicker(
        "update",
        moment(user.profile.birthday).format("DD.MM.YYYY")
      );
    }

    positions = this.data.user.profile.positions;
    if (positions) {
      posCheckboxes = $("#positions");

      for (i = 0; i < positions.length; i = i + 1) {
        posCheckboxes
          .find("input[value=" + positions[i] + "]")
          .prop("checked", true);
      }
    }
  }
});

Template.userForm.helpers({
  teams: function() {
    "use strict";
    var teams, team, i, result;

    teams = Teams.find({
      _id: {
        $in: _.flatten([
          Meteor.user().profile.teamIds,
          Roles.getGroupsForUser(Meteor.user(), "admin")
        ])
      }
    }).fetch();

    result = [];
    for (i = 0; i < teams.length; i = i + 1) {
      team = teams[i];

      if (Roles.userIsInRole(Meteor.user(), ["admin"], team._id)) {
        team.disabled = "";
      } else {
        team.disabled = "disabled";
      }

      if (this.user) {
        if (_.contains(this.user.profile.teamIds, team._id)) {
          team.checked = "checked";
        }
      }

      result.push(team);
    }

    return result;
  },
  isCreate: function() {
    "use strict";
    return Template.instance().data.action === "create";
  }
});

Template.userForm.events({
  "click #delete": function() {
    "use strict";
    bootbox.confirm("Sind sie sicher?", function(result) {
      if (result === true) {
        Meteor.call("deleteUser", $("#_id").val());
        Router.go("/users");
      }
    });
  }
});
