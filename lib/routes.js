/*global
    Meteor, Router, Events, _, $, Responses, moment, Tags, Teams, Session, Departments, Clubs,
    Template, Roles
 */
/* ================= *
 * Configuration     *
 * ================= */

Router.configure({
  layoutTemplate: "mainLayout",
  loadingTemplate: "loading",
  notFoundTemplate: "notFound"
});

/* ================= *
 * Before actions    *
 * ================= */

Router.onBeforeAction(function() {
  "use strict";
  if (!Meteor.userId()) {
    this.render("login");
  } else {
    this.wait(
      Meteor.subscribe("teamsByIds", Meteor.user().profile.teamIds, function() {
        var teamIds = Meteor.user().profile.teamIds;
        Teams.find({ _id: { $in: Meteor.user().profile.teamIds } }).map(
          function(team) {
            _.each(team.connectedTeamIds, function(teamId) {
              teamIds.push(teamId);
            });
          }
        );
        Session.setDefault("selectedTeamIds", _.uniq(teamIds));
      })
    );
    this.next();
  }
});

/* ================= *
 * Absences          *
 * ================= */

Router.route("/absences/create", {
  name: "createAbsence"
});

/* ================= *
 * Calendar          *
 * ================= */

Router.route("/calendar", function() {
  "use strict";
  this.render("calendar");
});

/* ================= *
 * Dashboard         *
 * ================= */

Router.route("/", function() {
  "use strict";
  this.render("dashboard");
});

/* ================= *
 * Events            *
 * ================= */

Router.route("/events/create", function() {
  "use strict";
  this.render("createEvent");
});

Router.route("/events/create/:start/:end", function() {
  "use strict";
  this.render("createEvent");
});

Router.route("/events/update/:_id", function() {
  "use strict";
  this.render("updateEvent");
});

Router.route("/events/details/:_id", function() {
  "use strict";
  var router = this;

  this.wait(Meteor.subscribe("eventsByIds", [this.params._id]));
  this.wait(Meteor.subscribe("responsesByEventIds", [this.params._id]));
  this.wait(Meteor.subscribe("usersByEventId", this.params._id));
  this.wait(Meteor.subscribe("absencesByEventIds", [this.params._id]));

  if (this.ready()) {
    this.render("eventDetails", {
      data: function() {
        var event, responses, users;
        event = Events.findOne(router.params._id);
        users = Meteor.users.find({
          "profile.teamIds": { $in: [event.teamId] }
        });
        responses = Responses.find({
          eventId: event._id,
          userId: {
            $in: users.map(function(user) {
              return user._id;
            })
          }
        }).fetch();
        return {
          event: event,
          tags: event.tags,
          responses: responses,
          yeses: Responses.find({
            eventId: event._id,
            value: "yes",
            userId: {
              $in: users.map(function(user) {
                return user._id;
              })
            }
          }).fetch(),
          nos: Responses.find({
            eventId: event._id,
            value: "no",
            userId: {
              $in: users.map(function(user) {
                return user._id;
              })
            }
          }).fetch(),
          users: users
        };
      }
    });
  } else {
    this.render("loading");
  }
});

Router.route("/events/:_id/respond", {
  name: "respondToEvent",
  subscriptions: function() {
    "use strict";
    return [
      Meteor.subscribe(
        "responsesByUserIdAndEventId",
        Meteor.userId(),
        this.params._id
      ),
      Meteor.subscribe("eventsByIds", [this.params._id])
    ];
  },
  data: function() {
    "use strict";
    return {
      event: Events.findOne(this.params._id),
      response: Responses.findOne({
        eventId: this.params._id,
        userId: Meteor.userId()
      })
    };
  }
});

/* ================= *
 * Lists             *
 * ================= */
Router.route("/lists/practiceAttendance", function() {
  "use strict";
  this.render("practiceAttendance");
});

Router.route("/lists/tournamentAttendance", function() {
  "use strict";
  this.render("tournamentAttendance");
});

Router.route("/lists/gameAttendance", function() {
  "use strict";
  this.render("gameAttendance");
});

Router.route("/lists/overviewLadiesAdmins", function() {
  "use strict";

  if (
    Roles.userIsInRole(
      Meteor.user(),
      "admin",
      Teams.findOne({ name: "Damen" })._id
    )
  ) {
    this.wait(
      Meteor.subscribe("usersByTeamIds", [Teams.findOne({ name: "Damen" })._id])
    );

    if (this.ready()) {
      this.render("overviewLadiesAdmins");
    } else {
      this.render("loading");
    }
  } else {
    this.render("notFound");
  }
});

Router.route("/lists/practiceAttendanceRatio", function() {
  "use strict";
  this.render("practiceAttendanceRatio");
});

/* ================= *
 * Teams             *
 * ================= */

Router.route("/teams/:_id", function() {
  "use strict";
  this.render("teamDetails");
});

Router.route("/teams/:_id/manageAdmins", function() {
  "use strict";
  if (Roles.userIsInRole(Meteor.user(), "admin", this.params._id)) {
    this.render("manageAdmins", {
      data: function() {
        return { type: "team" };
      }
    });
  } else {
    this.render("notFound");
  }
});

/* ================= *
 * Users             *
 * ================= */

Router.route("/users", function() {
  "use strict";
  this.render("users");
});

Router.route("/users/create", {
  name: "createUser"
});

Router.route("/users/details/:_id", function() {
  "use strict";
  this.render("userDetails");
});

Router.route("/users/edit/:_id", function() {
  "use strict";
  this.render("editUser");
});
